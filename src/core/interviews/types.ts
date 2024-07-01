import { GPTMessage } from "@/core/types";

import { Study } from "../studies/types";

export enum InterviewStatus {
	IN_PROGRESS = 'In Progress',
	NOT_STARTED = 'Not Started',
	COMPLETED = 'Completed',
	CANCELLED = 'Cancelled',
}

export type InterviewUserMetaData = {
	[key: string]: any;
};

export interface Interview {
	id?: string;
	status?: InterviewStatus;
	userMetaData?: InterviewUserMetaData;
	rawMessages?: GPTMessage[];
	organizationId?: string;
	studyId?: string;
	summary?: string;
	summaryTitle?: string;
	sentiment?: string;
	cachedStudy?: Study | { [key: string]: any; };
	cachedInterviewId?: string;
	createdAt?: Date | undefined;
}

export type InterviewCache = {
	studyId: string;
	study: Study | { [key: string]: any; };
	userMetaData: { [key: string]: any; };
	rawMessages: GPTMessage[];
	id: string;
}
