import { serve } from "inngest/next";

import { EventClient } from "@/server/events/client";
import authWebhookHandler from "@/server/events/jobs/authHook";
import helloworld from "@/server/events/jobs/helloworld";
import {
	bulkSummarizeInterviewsInStudy,
	interviewCheckForStaleHandler,
	interviewEmailNotifications,
	interviewEmailTranscriptHandler,
	interviewProcessHandler,
	interviewSummarizeHandler,
	interviewTagHandler
} from "@/server/events/jobs/interviewEvents";
import { bulkSummarizeByOrg, studyQuoteGenerator, studySummarizeHandler, studyThemeGenerator } from "@/server/events/jobs/studyEvents";
import { studyInsightGenerator } from "@/server/events/jobs/studyInsightEvents";
import { createDocumentEmbeddingHandling } from "@/server/events/jobs/vectorDocumentEvents";

export const config = {
	maxDuration: 300,
	api: {
		bodyParser: {
			sizeLimit: '5000kb',
		},
	},
};

export default serve({
	client: EventClient,
	functions: [
		helloworld,
		authWebhookHandler,
		interviewProcessHandler,
		interviewSummarizeHandler,
		interviewCheckForStaleHandler,
		studySummarizeHandler,
		interviewEmailTranscriptHandler,
		interviewEmailNotifications,
		interviewTagHandler,
		createDocumentEmbeddingHandling,
		studyInsightGenerator,
		bulkSummarizeInterviewsInStudy,
		bulkSummarizeByOrg,
		studyThemeGenerator,
		studyQuoteGenerator,
	],
	streaming: "allow",
});
