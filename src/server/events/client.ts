import { EventSchemas, Inngest } from 'inngest';

import { InterviewStatus } from '@/core/interviews/types';
import { VectorDocument, VectorDocumentType } from '@/core/vectorDocuments/types';
import logger from '@/server/utils/logger';

type InterviewProcess = {
	data: {
		interviewId: string;
		studyId: string;
		status?: InterviewStatus;
	}
}

type InterviewScheduledStaleProcess = {
	data: {
		interviewId: string;
		studyId: string;
		status?: InterviewStatus;
	}
}

type InterviewSummarize = {
	data: {
		interviewId: string;
	}
}

type InterviewBulkSummarizeByStudy = {
	data: {
		studyId: string;
		organizationId: string;
	}
}

type InterviewTag = {
	data: {
		interviewId: string;
		studyId: string;
		organizationId: string;
		regenerateEmbeddings?: boolean;
	}
}

type InterviewEmailTranscript = {
	data: {
		interviewId: string;
		email: string;
	}
}

type InterviewEmailNotifications = {
	data: {
		interviewId: string;
		studyId: string;
		email: string;
		metadata?: string;
	}
}

type InterviewCount = {
	data: {
		studyId: string;
	}
}

type StudySummary = {
	data: {
		studyId: string;
		organizationId: string;
	}
}

type StudySummaryThemes = {
	data: {
		studyId: string;
		organizationId: string;
	}
}

type StudySummaryQuotes = {
	data: {
		studyId: string;
		organizationId: string;
	}
}

type StudyBulkSummarizeByOrg = {
	data: {
		organizationId: string;
	}
}

type VectorDocumentEmbedding = {
	data: {
		studyId: string;
		organizationId: string;
		documentType: VectorDocumentType;
		documentReferenceId: string;
	}
}

type StudyInsightGenerate = {
	data: {
		studyInsightId?: string;
		studyId: string;
		organizationId: string;
		query: string;
	}
}

type HelloWorld = {
	data: {
		message: string;
	}
}

type AuthWebHook = {
	name: 'hook/auth',
	data: {
		type: string;
		data: { [key: string]: any };
	}
}

type Events = {
	'api/interview.emailNotifications': InterviewEmailNotifications,
	'api/interview.emailTranscript': InterviewEmailTranscript;
	'api/interview.process': InterviewProcess;
	'api/interview.scheduledStaleProcess': InterviewScheduledStaleProcess;
	'api/interview.summarize': InterviewSummarize;
	'api/interview.tag': InterviewTag;
	'api/interview.bulkSummarizeInStudy': InterviewBulkSummarizeByStudy;
	'api/study.completed': StudySummary;
	'api/study.themes': StudySummaryThemes;
	'api/study.quotes': StudySummaryQuotes;
	'api/study.bulkSummarizeInOrganization': StudyBulkSummarizeByOrg;
	'api/vectorDocument.embedding': VectorDocumentEmbedding;
	'api/studyInsight.generate': StudyInsightGenerate;
	// 'api/study.interviewCount': InterviewCount;
	'hook/auth': AuthWebHook;
	'internal/helloworld': HelloWorld;
}

export const EventClient = new Inngest({
	id: "onestudyai",
	name: "onestudy.ai",
	schemas: new EventSchemas().fromRecord<Events>(),
	logger: logger,
});
