import { NonRetriableError, slugify } from "inngest";
import { ChatCompletionRequestMessageRoleEnum } from "openai-edge";
import { Svix } from "svix";

import { endInterviewDelimiter } from "@/core/ai/utils";
import {
  interviewSentimentPrompt,
  interviewSummaryPrompt,
  interviewSummaryTitlePrompt,
  interviewTagPrompt,
} from "@/core/interviews/prompts";
import { InterviewStatus } from "@/core/interviews/types";
import { VectorDocumentType } from "@/core/vectorDocuments/types";
import { summary } from "@/server/ai/summary";
import { EventName, sendAnalytics } from "@/server/analytics";
import {
  createInterview,
  getInterview,
  getInterviews,
  updateInterview,
} from "@/server/data/interview";
import { getStudy } from "@/server/data/study";
import { getStudyEmailByStudyId } from "@/server/data/study/studyEmails";
import { generateTags } from "@/server/data/tag";
import {
  deleteInterview,
  getInterview as getCachedInterview,
} from "@/server/edgeData/interview";
import { EventClient } from "@/server/events/client";
import { sendInterviewEmailNotifications } from "@/server/notifications/interview/emailNotifications";
import { sendTranscriptionEmail } from "@/server/notifications/interview/transcript";

if (!process.env.SVIX_API_KEY) {
  throw new Error("Missing SVIX_API_KEY");
}

const svix = new Svix(process.env.SVIX_API_KEY);

// Handles processing of an interview from the cache
export const interviewProcessHandler = EventClient.createFunction(
  { name: "Process interview event", id: slugify("Process interview event") },
  { event: "api/interview.process" },
  async ({ event, step, logger }) => {
    const interview = await step.run("process-cached-interview", async () => {
      const body = event.data;
      logger.info(
        { interviewId: body.interviewId },
        "Interview process event received"
      );

      const interviewCache = await getCachedInterview(body.interviewId);
      if (!interviewCache) {
        throw new NonRetriableError(
          `Interview ${body.interviewId} not found in cache`
        );
      }

      const messages = interviewCache.rawMessages?.map((r: any) => {
        return {
          ...r,
          content: r.content.replace(
            new RegExp(endInterviewDelimiter, "g"),
            ""
          ),
        };
      });

      const newInterview = await createInterview(
        interviewCache.studyId,
        interviewCache.study.organizationId,
        {
          status: body.status || InterviewStatus.COMPLETED,
          userMetaData: interviewCache.userMetaData,
          rawMessages: messages,
          cachedStudy: interviewCache.study,
          cachedInterviewId: body.interviewId,
        }
      );

      sendAnalytics(EventName.InterviewCompleted, {
        ...newInterview,
        studyId: interviewCache.studyId,
      });

      return newInterview;
    });

    await step.sleep("wait-before-summarize-send", "5 seconds");

    if (interview?.[0].id) {
      if (event.data.status !== InterviewStatus.CANCELLED) {
        await step.sendEvent("send-interview-summarize", {
          name: "api/interview.summarize",
          data: {
            interviewId: interview[0].id,
          },
        });
      }

      await step.run("Remove old cached interview", async () => {
        const body = event.data;
        logger.info(
          { interviewId: body.interviewId },
          "Deleting cached interview"
        );
        return await deleteInterview(body.interviewId);
      });

      await step.sleep("wait-before-interview-tag-send", "1 seconds");

      if (interview[0].organizationId) {
        await step.sendEvent("tag-interview", {
          name: "api/interview.tag",
          data: {
            interviewId: interview[0].id,
            studyId: event.data.studyId,
            organizationId: interview[0].organizationId,
          },
        });
      }
    }
  }
);

// Handles summarizing the interview
export const interviewSummarizeHandler = EventClient.createFunction(
  {
    name: "Summarize interview event",
    id: slugify("Summarize interview event"),
  },
  { event: "api/interview.summarize" },
  async ({ event, step, logger }) => {
    // First summarize the body
    const output = await step.run("summarize-interview", async () => {
      const prompt = interviewSummaryPrompt();

      logger.info(
        { interviewId: event.data.interviewId },
        `Getting interview summary`
      );

      const interview = await getInterview(event.data.interviewId);
      const messages = interview?.rawMessages
        ?.map((r: any) => r.content)
        .join("\n");
      const results = await summary({
        messages: [
          {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: `${prompt}\n${messages}`,
          },
        ],
      });
      const payload = await results.json();

      if (payload.error) {
        logger.error(
          { interviewId: event.data.interviewId, error: payload.error },
          `Error generating interview summary`
        );
        throw new Error(payload.error.message);
      }

      sendAnalytics(EventName.InterviewSummarized, {
        interviewId: event.data.interviewId,
        organizationId: interview?.organizationId,
        studyId: interview?.studyId,
      });

      return payload.choices[0].message?.content as string;
    });

    await step.sleep("wait-before-title-generation", "1s");

    // Then summarize the title
    const title = await step.run("generate-a-title", async () => {
      const prompt = interviewSummaryTitlePrompt();

      logger.info(
        { interviewId: event.data.interviewId },
        `Getting interview title summary`
      );

      const results = await summary({
        messages: [
          {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: `${prompt}\n${output}`,
          },
        ],
      });
      const payload = await results.json();

      return payload.choices[0].message?.content;
    });

    // Get the sentiment of the interview
    const sentiment = await step.run("interview-sentiment", async () => {
      const prompt = interviewSentimentPrompt();
      const interview = await getInterview(event.data.interviewId);
      const messages = interview?.rawMessages
        ?.map((r: any) => r.content)
        .join("\n");

      logger.info(
        { interviewId: event.data.interviewId },
        `Getting interview sentiment`
      );

      const results = await summary({
        messages: [
          {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: `${prompt}\n${messages}`,
          },
        ],
      });
      const payload = await results.json();

      return payload.choices[0].message?.content;
    });

    // Then save summaries to db
    await step.run("update-interview-summaries-to-database", async () => {
      if (output || title) {
        logger.info(
          {
            interviewId: event.data.interviewId,
            summaryTitle: title,
          },
          `Saving interview summary data`
        );

        await updateInterview(event.data.interviewId, {
          summary: output || undefined,
          summaryTitle: title || undefined,
          sentiment: sentiment || undefined,
        });
      }
    });

    const interview = await getInterview(event.data.interviewId);
    if (interview) {
      await step.sendEvent("vector-embeddings", {
        name: "api/vectorDocument.embedding",
        data: {
          documentReferenceId: event.data.interviewId,
          documentType: VectorDocumentType.Interview,
          organizationId: interview.organizationId!,
          studyId: interview.studyId!,
        },
      });

      await step.run("webhook-interview-finished", async () => {
        if (output || title) {
          // Send webhook event
          await svix.message.create(interview.organizationId!, {
            eventType: "interview.finished",
            payload: {
              eventType: "interview.finished",
              id: interview.id,
              status: interview.status,
              link: `https://${process.env.NEXT_PUBLIC_DOMAIN_URL}/studies/${interview.studyId}/interview/${interview.id}`,
              summary: output || undefined,
              summaryTitle: title || undefined,
              sentiment: sentiment || undefined,
              study: {
                id: interview.studyId,
                name: interview.cachedStudy?.name,
              },
            },
          });

          await updateInterview(event.data.interviewId, {
            summary: output || undefined,
            summaryTitle: title || undefined,
            sentiment: sentiment || undefined,
          });
        }
      });
    }

    // This is for the transcript opt in from respondent
    const email = await step.run(
      "check-if-interview-should-be-emailed",
      async () => {
        const interview = await getInterview(event.data.interviewId);
        if (interview?.userMetaData?.transcriptOptIn) {
          const emailKey = Object.keys(interview.userMetaData).find((key) => {
            const value = interview.userMetaData?.[key];
            // Check if the value matches the format of an email address
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
              value
            );
          });

          return emailKey ? interview.userMetaData?.[emailKey] : undefined;
        }
      }
    );

    if (email) {
      await step.sendEvent("email-transcript", {
        name: "api/interview.emailTranscript",
        data: {
          interviewId: event.data.interviewId,
          email: email,
        },
      });
    }

    // This is for the customers that have specified an email to send the transcript to
    const emailNotificationEmails = await step.run(
      "check-if-interview-email-notifications",
      async () => {
        const interview = await getInterview(event.data.interviewId);
        if (interview?.studyId) {
          const emailStudy = await getStudyEmailByStudyId(interview.studyId);
          if (emailStudy?.meta?.emails) {
            return {
              emails: emailStudy.meta.emails,
              studyId: interview.studyId,
            };
          }
        }
      }
    );

    if (emailNotificationEmails && emailNotificationEmails.emails?.length > 0) {
      const events = emailNotificationEmails.emails.map((email: string) => {
        return {
          name: "api/interview.emailNotifications",
          data: {
            interviewId: event.data.interviewId,
            studyId: emailNotificationEmails.studyId,
            email: email,
          },
        };
      });

      await step.sendEvent("fan-out-interview-email-notifications", events);
    }

    return { output, title };
  }
);

// Handles scheduling a stale interview check
export const interviewCheckForStaleHandler = EventClient.createFunction(
  {
    name: "Schedule check for stale interview",
    id: slugify("Schedule check for stale interview"),
  },
  { event: "api/interview.scheduledStaleProcess" },
  async ({ event, step, logger }) => {
    await step.sleep("wait-for-stale-interview", "1 hour");

    const body = event.data;
    const interview = await step.run(
      "check-if-interview-is-stale",
      async () => {
        logger.info(
          { interviewId: body.interviewId },
          "Check for stale interview event received"
        );

        return await getCachedInterview(body.interviewId);
      }
    );

    if (interview) {
      logger.info(
        { interviewId: body.interviewId },
        "Stale interview found, init processing"
      );

      await step.sendEvent("send-process-interview", {
        name: "api/interview.process",
        data: {
          interviewId: body.interviewId,
          studyId: interview.studyId,
          status: InterviewStatus.CANCELLED,
        },
      });
    }

    return { success: true };
  }
);

// Email interview transcript
export const interviewEmailTranscriptHandler = EventClient.createFunction(
  {
    name: "Email interview transcript",
    id: slugify("Email interview transcript"),
  },
  { event: "api/interview.emailTranscript" },
  async ({ event, step, logger }) => {
    const body = event.data;
    logger.info(
      { interviewId: event.data.interviewId },
      `Sending interview transcript`
    );

    if (body.email && body.interviewId) {
      try {
        await sendTranscriptionEmail(body.interviewId, body.email);
      } catch (error: any) {
        logger.error(
          { interviewId: event.data.interviewId, error },
          `Error generating interview transcript`
        );
        throw new Error(error.message);
      }
    }

    return { success: true };
  }
);

// Interview email notifications transcript
export const interviewEmailNotifications = EventClient.createFunction(
  {
    name: "Email interview notifications",
    id: slugify("Email interview notifications"),
  },
  { event: "api/interview.emailNotifications" },
  async ({ event, step, logger }) => {
    const body = event.data;
    logger.info(
      { interviewId: event.data.interviewId },
      `Sending interview notificaiton`
    );

    if (body.email && body.interviewId) {
      const study = await getStudy(body.studyId);
      const interview = await getInterview(event.data.interviewId);
      await sendInterviewEmailNotifications(
        body.interviewId,
        body.studyId,
        study?.name || "",
        body.email,
        interview?.userMetaData
      );
    }

    return { success: true };
  }
);

// Handles tagging an interview
/**
 * To test in Inngest:
{
	"name": "api/interview.tag",
	"data": {
		"interviewId": "29c0e1c2-aa06-4941-b7bb-84afbd5b3ae0",
		"organizationId": "org_2TIGbrG77qscM4VIpIshBks0CZ7",
		"studyId": "a6bd9f58-4111-4c7f-bf53-9ec209ad667b"
	},
	"user": {}
}
 */
export const interviewTagHandler = EventClient.createFunction(
  { name: "Tag an interview event", id: "tag-interview" },
  { event: "api/interview.tag" },
  async ({ event, step, logger }) => {
    const output = await step.run("Tag interview", async () => {
      try {
        logger.info(
          { interviewId: event.data.interviewId },
          `Tagging interview`
        );

        const results = await generateTags(
          event.data.organizationId,
          event.data.studyId,
          event.data.interviewId
        );

        sendAnalytics(EventName.InterviewTagged, {
          interviewId: event.data.interviewId,
          organizationId: event.data.organizationId,
          studyId: event.data.studyId,
        });

        if (event.data.regenerateEmbeddings) {
          const interview = await getInterview(event.data.interviewId);
          if (interview) {
            await step.sendEvent("regenerate-vector-embeddings", {
              name: "api/vectorDocument.embedding",
              data: {
                documentReferenceId: event.data.interviewId,
                documentType: VectorDocumentType.Interview,
                organizationId: interview.organizationId!,
                studyId: interview.studyId!,
              },
            });
          }
        }

        return results;
      } catch (e: any) {
        throw new NonRetriableError(e.message || "Error generating tags");
      }
    });

    return { output };
  }
);

export const bulkSummarizeInterviewsInStudy = EventClient.createFunction(
  {
    name: "Bulk summarize interviews in study",
    id: "bulk-summarize-interviews-in-study",
  },
  { event: "api/interview.bulkSummarizeInStudy" },
  async ({ event, step, logger }) => {
    const output = await step.run(
      "Bulk summarize interviews in study",
      async () => {
        try {
          logger.info(
            { studyId: event.data.studyId },
            `Bulk summarizing interviews in study`
          );

          const interviews = await getInterviews(
            event.data.studyId,
            event.data.organizationId
          );
          const interviewIds = interviews.map((i: any) => i.id);

          return interviewIds;
        } catch (e: any) {
          throw new NonRetriableError(e.message || "Error generating tags");
        }
      }
    );

    const events = output.map((interviewId: string) => {
      return {
        name: "api/interview.summarize",
        data: {
          interviewId: interviewId,
        },
      };
    });

    // @ts-ignore
    await step.sendEvent("fan-out-interview-summarize", events);

    return { output };
  }
);
