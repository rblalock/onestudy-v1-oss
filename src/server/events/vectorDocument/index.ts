import { VectorDocumentType } from '@/core/vectorDocuments/types';
import { EventClient } from '@/server/events/client';

export const emitGenerateEmbeddings = async (payload: {
	documentReferenceId: string;
	type: VectorDocumentType
	studyId: string;
	organizationId: string;
}) => {
	return EventClient.send({
		name: 'api/vectorDocument.embedding',
		data: {
			documentReferenceId: payload.documentReferenceId,
			documentType: payload.type,
			organizationId: payload.organizationId,
			studyId: payload.studyId,
		},
	});
};
