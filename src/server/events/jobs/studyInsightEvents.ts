import { slugify } from "inngest";
import { Svix } from "svix";

import {
  InsightReferencedDocuments,
  RAGResponse,
  VectorDocument,
  VectorDocumentType,
} from "@/core/vectorDocuments/types";
import { generateEmbeddings } from "@/server/ai/embedding";
import { ragSearch } from "@/server/ai/ragSearch";
import { EventName, sendAnalytics } from "@/server/analytics";
import {
  createStudyInsight,
  updateStudyInsight,
} from "@/server/data/studyInsights";
import { vectorSearch } from "@/server/data/vectorDocuments";
import { EventClient } from "@/server/events/client";

if (!process.env.SVIX_API_KEY) {
  throw new Error("Missing SVIX_API_KEY");
}

const svix = new Svix(process.env.SVIX_API_KEY);

// Handle generate study insight
export const studyInsightGenerator = EventClient.createFunction(
  { name: "Generate a study insight", id: slugify("generate a study insight") },
  { event: "api/studyInsight.generate" },
  async ({ event, step, logger }) => {
    // First get the embeddings for the query
    const embeddings = await step.run("get-query-embeddings", async () => {
      logger.info(
        { studyId: event.data.studyId },
        `Getting embeddings for study`
      );

      const embeddings = await generateEmbeddings({
        input: `${event.data.query}`,
      });
      const vectors = embeddings.data?.[0].embedding;

      return vectors;
    });

    // Then get the related documents
    const documents = await step.run("get-related-research", async () => {
      logger.info(
        { studyId: event.data.studyId },
        `Getting related documents for study`
      );

      const records = await vectorSearch(
        event.data.studyId,
        event.data.organizationId,
        embeddings
      );

      return records;
    });

    // Then get the study insights
    const studyInsights = await step.run("get-study-insights", async () => {
      logger.info({ studyId: event.data.studyId }, `Generating study insights`);

      const docs = documents as VectorDocument[];

      const prompt = `
				Interview sections:
				${docs
          .map(
            (r) =>
              `${r.documentTitle} ${r.documentBody}\ndocumentReferenceId:${r.documentReferenceId}`
          )
          .join("\n")}
			
				Question: """
				${event.data.query}
				"""
		
				Export the data as JSON using the following format:
				export interface RAG {
					documentReferenceIds: string[];
					explanation: string;
				}
				Where documentReferenceIds are references to the interview sections 
				that are related to the question. Do not re-use a documentReferenceId.
				Where explanation is a markdown formatted string with the answer.
		
				If you reference a documentReferenceId, do not refer to it as "document reference" 
				Only use the ID provided and refer it it as with "as found in". Do not wrap in quotes or backticks
		
				If you are unable to answer the question, please respond with "I am not able to determine this right now".
			`
        .trim()
        .replace(/\t/g, "");

      const payload = await ragSearch(prompt);
      const response = JSON.parse(
        payload.choices[0].message?.content || "{}"
      ) as RAGResponse;
      const referencedDocuments = docs
        .filter((r) => {
          if (r.documentReferenceId) {
            return response?.documentReferenceIds?.includes(
              r.documentReferenceId
            );
          }
        })
        .map((r) => {
          const tags: {
            [key: string]: {
              tag: string;
              color: string | undefined;
              count: number;
            };
          } = {};

          if (r.meta?.rawMessages) {
            r.meta.rawMessages.forEach((message: any) => {
              if (message.annotations) {
                message.annotations.forEach((annotation: any) => {
                  if (annotation.tag) {
                    if (!tags[annotation.tag]) {
                      tags[annotation.tag] = {
                        tag: annotation.tag,
                        color: annotation.color,
                        count: 1,
                      };
                    } else {
                      tags[annotation.tag] = {
                        tag: annotation.tag,
                        color: annotation.color,
                        count: tags[annotation.tag].count + 1,
                      };
                    }
                  }
                });
              }
            });
          }

          return {
            documentReferenceId: r.documentReferenceId,
            documentType: r.documentType,
            documentTitle: r.documentTitle,
            tags: tags ? Object.values(tags) : undefined,
          };
        });

      return {
        referencedDocuments,
        ragResponse: response,
      };
    });

    const savedInsights = await step.run("save-study-insights", async () => {
      logger.info({ studyId: event.data.studyId }, `Saving study insights`);

      logger.info(
        { orgId: event.data.organizationId, studyId: event.data.studyId },
        `Creating study insight`
      );

      // Send webhook event
      try {
        await svix.message.create(event.data.organizationId, {
          eventType: "study.insight",
          payload: {
            eventType: "study.insight",
            id: event.data.studyInsightId,
            question: event.data.query,
            response: convertIdsToLinks(
              studyInsights.ragResponse.explanation || "",
              studyInsights.ragResponse.documentReferenceIds || [],
              event.data.studyId
            ),
            link: `https://${process.env.NEXT_PUBLIC_DOMAIN_URL}/studies/${event.data.studyId}/insights`,
          },
        });
      } catch (err) {
        logger.error(
          { studyId: event.data.studyId },
          `Error logging webhook event: ${err}`
        );
      }

      if (event.data.studyInsightId) {
        await updateStudyInsight(event.data.studyInsightId, {
          response: studyInsights.ragResponse,
          referencedDocuments:
            studyInsights.referencedDocuments as InsightReferencedDocuments[],
          processing: false,
        });

        sendAnalytics(EventName.UpdateStudyInsight, {
          organizationId: event.data.organizationId,
          studyInsightId: event.data.studyInsightId,
        });
      } else {
        const studyInsight = await createStudyInsight(
          event.data.studyId,
          event.data.organizationId,
          event.data.query,
          {
            response: studyInsights.ragResponse,
            referencedDocuments:
              studyInsights.referencedDocuments as InsightReferencedDocuments[],
            processing: false,
          }
        );

        sendAnalytics(EventName.CreateStudyInsight, {
          organizationId: event.data.organizationId,
          studyInsightId: studyInsight?.[0].id,
        });
      }

      return event.data.studyInsightId;
    });

    return { savedInsights };
  }
);

const convertIdsToLinks = (
  text: string,
  documentReferenceIDs: string[],
  studyId: string
): string => {
  if (documentReferenceIDs.length === 0) {
    return text;
  }

  const idRegex = new RegExp(documentReferenceIDs.join("|"), "g");
  return text.replace(
    idRegex,
    (matchedId) =>
      `[interview link](https://${process.env.NEXT_PUBLIC_DOMAIN_URL}/studies/${studyId}/interview/${matchedId})`
  );
};
