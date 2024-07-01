import { NonRetriableError, slugify } from 'inngest';
import { ChatCompletionRequestMessageRoleEnum } from "openai-edge";

import { VectorDocumentType } from "@/core/vectorDocuments/types";
import { EventName, sendAnalytics } from "@/server/analytics";
import { getInterview } from "@/server/data/interview";
import { createEmbeddingWithDocument } from "@/server/data/vectorDocuments";
import { EventClient } from "@/server/events/client";

// Handles an embedding event
/**
 * To test in Inngest:
{
	"name": "api/vectorDocument.embedding",
	"data": {
		"organizationId": "org_2TIGbrG77qscM4VIpIshBks0CZ7",
		"studyId": "f7edb33a-69f7-4726-94c0-1fed30b9f1ed",
		"documentType": "interview",
		"documentReferenceId": "7f0ba537-56d5-411e-9a12-39bb91d717bb"
	}
}
 */
export const createDocumentEmbeddingHandling = EventClient.createFunction(
	{ name: "Create a document embedding record", id: 'vector-embedding' },
	{ event: "api/vectorDocument.embedding" },
	async ({ event, step, logger }) => {
		const output = await step.run("Embedding and save for document", async () => {
			try {
				logger.info(
					{ 
						documentReferenceId: event.data.documentReferenceId,
						documentType: event.data.documentType,
						organizationId: event.data.organizationId,
						studyId: event.data.studyId,
					},
					`Saving embedding document`
				);

				// Handle interview type 
				if (event.data.documentType === VectorDocumentType.Interview) {
					const interview = await getInterview(event.data.documentReferenceId);
					
					if (interview) {
						const body = interview?.rawMessages
							?.filter((m: any) => m.role !== ChatCompletionRequestMessageRoleEnum.System)
							?.map((r: any) => r.content).join('\n');
						const tags = interview.rawMessages
							?.map((r: any) => r.annotations?.map((a: any) => a.tag as string))
							.flat() as string[];

						const results = await createEmbeddingWithDocument(
							event.data.studyId,
							event.data.organizationId,
							event.data.documentType,
							event.data.documentReferenceId,
							body ? `
								Summary: ${interview.summary || ''}
								Interview: ${body} 
								Tags: ${tags || ''}`.trim().replace(/\t/g, '')
							: '',
							interview.summaryTitle || '',
							{
								rawMessages: interview?.rawMessages
							}
						);

						return results;
					}
				}

				sendAnalytics(EventName.VectorDocumentEmbedding, {
					documentReferenceId: event.data.documentReferenceId,
					documentType: event.data.documentType,
					organizationId: event.data.organizationId,
					studyId: event.data.studyId,
				});
			} catch (e: any) {
				throw new NonRetriableError(e.message || 'Error generating embeddings');
			}
		});

		return { output };
	}
);
