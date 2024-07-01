
export enum VectorDocumentType {
	Study = "study",
	Interview = "interview",
}

export interface VectorDocument {
	id?: string;
	documentType?: VectorDocumentType;
	documentTitle?: string;
	documentBody?: string;
	embedding?: number[];
	documentReferenceId?: string;
	meta: {[key: string]: any};
	organizationId?: string;
	studyId?: string;
}

export interface RAGResponse {
	documentReferenceIds: string[];
	explanation: string;
}

export interface InsightReferencedDocuments {
	documentReferenceId: string | undefined;
	documentType: VectorDocumentType | undefined;
	documentTitle: string | undefined;
	tags: {
		tag: string;
		color: string | undefined;
		count: number;
	}[] | undefined;
}

export interface SearchInsightsResponse {
	response: RAGResponse;
	referencedDocuments: InsightReferencedDocuments[];
}
