import { InterviewStatus } from '@/core/interviews/types';
import { EventClient } from '@/server/events/client';

export const emitProcessInterview = async (payload: {
	interviewId: string;
	studyId: string;
	status?: InterviewStatus;
}) => {
	return EventClient.send({
		name: 'api/interview.process',
		id: `process-interview-${payload.interviewId}-${payload.studyId}`,
		data: {
			interviewId: payload.interviewId,
			studyId: payload.studyId,
			status: payload.status,
		},
	});
};

export const emitScheduleInterviewCheck = async (payload: {
	interviewId: string;
	studyId: string;
}) => {
	return EventClient.send({
		name: 'api/interview.scheduledStaleProcess',
		id: `check-interview-${payload.interviewId}-${payload.studyId}`,
		data: {
			interviewId: payload.interviewId,
			studyId: payload.studyId,
		},
	});
};

export const emitSummarizeInterview = async (payload: {
	interviewId: string;
}) => {
	return EventClient.send({
		name: 'api/interview.summarize',
		data: {
			interviewId: payload.interviewId,
		},
	});
};

export const emitInterviewAutoTag = async (payload: {
	interviewId: string;
	studyId: string;
	organizationId: string;
}) => {
	return EventClient.send({
		name: 'api/interview.tag',
		data: {
			interviewId: payload.interviewId,
			studyId: payload.studyId,
			organizationId: payload.organizationId,
		},
	});
};
