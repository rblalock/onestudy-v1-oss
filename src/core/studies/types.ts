import { InsightReferencedDocuments, RAGResponse } from "@/core/vectorDocuments/types";

export enum StudyStatus {
	ACTIVE = 'Active',
	INACTIVE = 'Inactive',
	COMPLETED = 'Completed',
	CANCELLED = 'Cancelled'
}

export type StudyUserMetaData = {
	key: string;
	type: string;
	label: string;
	required?: boolean;
};

export interface Study {
	id: string;
	name: string;
	status?: StudyStatus;
	summary?: string;
	interviewerStyle?: string;
	interviewerStyleCustomMessage?: string;
	organizationId: string;
	userId: string;
	orgGroup?: string;
	meta?: {
		numberCompleted?: number;
		generalInformation?: string;
		firstQuestion?: string;
		farewellMessage?: string;
		followUpQuestionNumber?: number;
		shareTitle?: string;
		shareDescription?: string;
		primaryColor?: string;
		imageUrl?: string;
		embedUrls?: string[];
		audioEnabled?: boolean;
		themes?: {
			response: {
				documentReferenceIds: string[];
				explanation: string;
			};
			referencedDocuments: InsightReferencedDocuments[];
			processing: boolean;
		};
		insights?: {
			response: {
				documentReferenceIds: string[];
				explanation: string;
			};
			referencedDocuments: InsightReferencedDocuments[];
			processing: boolean;
		};
		thematicQuotes?: {
			response: {
				documentReferenceIds: string[];
				explanation: string;
			};
			referencedDocuments: InsightReferencedDocuments[];
			processing: boolean;
		};
		notableQuotes?: {
			response: {
				documentReferenceIds: string[];
				explanation: string;
			};
			referencedDocuments: InsightReferencedDocuments[];
			processing: boolean;
		};
		[key: string]: any;
	};
	userMetaData?: StudyUserMetaData[];
	createdAt: Date | undefined;
}

export interface StudyEmails {
	id: string;
	organizationId: string;
	studyId: string;
	meta?: {
		emails?: string[];
	};
}

export interface StudyInsight {
	id: string;
	studyId: string | null;
	organizationId: string | null;
	response: RAGResponse | null;
	question: string;
	keyQuote?: string;
	shared?: boolean;
	processing?: boolean;
	referencedDocuments?: InsightReferencedDocuments[] | null;
}
