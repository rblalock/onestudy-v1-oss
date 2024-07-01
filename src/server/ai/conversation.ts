import { Configuration, OpenAIApi } from 'openai-edge'
import { GPTMessage } from '@/core/types';

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY environment variable not set')
}

const config = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
})

export const AIConversationClient = new OpenAIApi(config);
export const conversationModel = process.env.CONVERSATION_MODEL || 'gpt-4';

export type ConversationArgs = {
	messages: GPTMessage[];
}

export const conversation = async (args: ConversationArgs) => {
	return AIConversationClient.createChatCompletion({
		model: conversationModel,
		stream: true,
		messages: args.messages,
		// max_tokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : 500,
		// top_p: 1,
		// temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
		// n: 1,
	})
};
