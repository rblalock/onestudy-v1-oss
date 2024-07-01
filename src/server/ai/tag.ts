import OpenAI from 'openai';
import { GPTMessage } from '@/core/types';

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY environment variable not set')
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// We set this model because of JSON output: https://platform.openai.com/docs/guides/text-generation
export const conversationModel = 'gpt-4-1106-preview';

export type TagArgs = {
	text: string;
	prompt: string;
}

export const tag = async (args: TagArgs) => {
	return openai.chat.completions.create({
		model: conversationModel,
		messages: [
			{
				role: 'system',
				content: args.prompt,
			},
			{
				role: 'user',
				content: args.text,
			}
		],
		response_format: { type: "json_object" }
	})
};

export const sanitizeTags = (annotations: {
	text: string;
	tag: string;
}[]) => {
	// Make sure AI spit out the right format
	const sanitizedRows = annotations.filter(annotation => {
		return typeof annotation.text === 'string' && typeof annotation.tag === 'string';
	});

	return sanitizedRows;
}
