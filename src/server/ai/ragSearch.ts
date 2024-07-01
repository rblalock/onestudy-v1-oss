import OpenAI from 'openai';

import { GPTMessage } from '@/core/types';

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY environment variable not set')
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});
export const conversationModel = 'gpt-4-turbo-preview';

export type ConversationArgs = {
	messages: GPTMessage[];
}

export const ragSearch = async (prompt: string) => {
	return openai.chat.completions.create({
		model: conversationModel,
		messages: [
			{
				role: 'system',
				content: `
					You are a research expert representative who loves
					to help people with their research! Given the following sections from user
					interactions and conversations, answer the question using only that information.
				`.trim().replace(/\t/g, ''),
			},
			{
				role: 'user',
				content: prompt,
			},
		],
		response_format: { type: "json_object" }
	})
};
