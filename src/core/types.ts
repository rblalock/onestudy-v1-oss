import { ChatCompletionRequestMessageRoleEnum } from "openai-edge";

export interface GPTMessage {
	id?: string;
	name?: string;
	role: ChatCompletionRequestMessageRoleEnum;
	content: string;
	annotations?: Annotation[];
}

export type GPTMessageWithID = Required<Pick<GPTMessage, 'id'>> & Omit<GPTMessage, 'id'>;

export interface OrganizationGroup {
	id: string;
	uuid: string;
	name: string;
	organizationId: string;
	meta: { [key: string]: any };
}

export interface ApiKey {
	id: string;
	name: string;
	apiId: string;
	workspaceId: string;
	start: string;
	createdAt: number;
	expires: number | null;
	ratelimit: {
		type: string;
		limit: number;
		refillRate: number;
		refillInterval: number;
	};
}

export type Annotation = {
	start: number;
	end: number;
	text?: string;
	color?: string;
	tag?: string;
};
