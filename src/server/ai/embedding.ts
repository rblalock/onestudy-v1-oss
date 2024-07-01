import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY environment variable not set')
}

export const AIClient = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});
export const model = 'text-embedding-ada-002';

export const generateEmbeddings = async (args: {
	input: string,
}) => {
	return AIClient.embeddings.create({
		model,
		input: args.input,
		encoding_format: "float",
	});
};
