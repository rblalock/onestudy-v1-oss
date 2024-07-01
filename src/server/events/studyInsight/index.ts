import { EventClient } from '@/server/events/client';

export const emitGenerateStudyInsight = async (payload: {
	studyId: string;
	studyInsightId: string;
	organizationId: string;
	query: string;
}) => {
	return EventClient.send({
		name: 'api/studyInsight.generate',
		data: {
			studyId: payload.studyId,
			query: payload.query,
			studyInsightId: payload.studyInsightId,
			organizationId: payload.organizationId,
		},
	});
};
