import { EventClient } from '@/server/events/client';

export const emitSummarizeStudy = async (payload: {
	studyId: string;
	organizationId: string;
}) => {
	return EventClient.send({
		name: 'api/study.completed',
		data: {
			studyId: payload.studyId,
			organizationId: payload.organizationId,
		},
	});
};

export const emitSummarizeStudyThemes = async (payload: {
	studyId: string;
	organizationId: string;
}) => {
	return EventClient.send({
		name: 'api/study.themes',
		data: {
			studyId: payload.studyId,
			organizationId: payload.organizationId,
		},
	});
};

export const emitSummarizeStudyQuotes = async (payload: {
	studyId: string;
	organizationId: string;
}) => {
	return EventClient.send({
		name: 'api/study.quotes',
		data: {
			studyId: payload.studyId,
			organizationId: payload.organizationId,
		},
	});
};
