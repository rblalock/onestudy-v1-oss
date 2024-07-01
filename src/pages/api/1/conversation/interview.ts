import { OpenAIStream, StreamingTextResponse } from 'ai';
import * as jose from 'jose';
import { NextRequest, NextResponse } from 'next/server';

import { endInterviewDelimiter } from '@/core/ai/utils';
import { GPTMessage } from '@/core/types';
import { conversation } from '@/server/ai/conversation';
import { EventName, sendAnalytics } from '@/server/analytics';
import { updateInterview } from '@/server/edgeData/interview';
import { emitProcessInterview } from '@/server/events/interview';
import logger from '@/server/utils/logger';
import { conversationRateLimit } from "@/server/utils/rate-limit";

export const config = {
	runtime: 'edge',
};

export default async function interviewConversationPublicApi(
	req: NextRequest,
	res: NextResponse
) {
	// CORS handling
	req.headers.set('Access-Control-Allow-Origin', '*');
	req.headers.set('Access-Control-Allow-Credentials', 'true')
	req.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT')
	req.headers.set(
		'Access-Control-Allow-Headers',
		'Authorization, x-api-key, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
	);
	// Preflight request
	if (req.method === 'OPTIONS') {
		return NextResponse.next();
	}

	// Check against valid token
	const token = req.headers.get('Authorization')?.split(' ')[1];
	if (!token) {
		logger.error(
			{},
			`Missing token`
		);
		return NextResponse.json({ 
			message: 'Missing token',
			success: false
		}, { status: 401 });
	}
	const creds: {[key: string]: string} = {};
	try {
		const { payload: decoded } = await jose.jwtVerify(
			token, 
			new TextEncoder().encode(process.env.JWT_SECRET!)
		);
		creds['studyId'] = decoded.studyId as string;
		creds['interviewId'] = decoded.interviewId as string;
		creds['organizationId'] = decoded.organizationId as string;
		logger.info(
			{ token: decoded },
			`Request sent with valid token`
		);
	} catch (error) {
		logger.error(
			{ token, error},
			`Invalid or expired token`
		);
		return NextResponse.json({ 
			message: 'Invalid or expired token',
			success: false
		}, { status: 401 });
	}

	const json = await req.json();

	// Double check token creds and what is being sent over
	if (
		creds['studyId'] !== json.interview.studyId ||
		creds['interviewId'] !== json.interview.id
	) {
		logger.error(
			{ creds },
			`Mismatch of token credentials and interview credentials`
		);
		return NextResponse.json({ 
			message: 'Mismatch of token credentials and interview credentials' }, 
			{ status: 401 }
		);
	}

	// Rate limit check
	const { success } = await conversationRateLimit.limit(json.interview.id);
	if (!success) {
		return NextResponse.json({ message: 'Rate limit exceeded' }, { status: 429 });
	}

	// Store current conversation in cache
	updateInterview(json.interview.id, json.messages);

	const messages: GPTMessage[] = json.messages || [];
	const endOfInterviewMessage = messages.find((message: GPTMessage) => message.content.includes(endInterviewDelimiter));

	if (json.questionsLeft > 0 || !endOfInterviewMessage) {
		const response = await conversation({
			messages: json.messages || []
		});
		const stream = OpenAIStream(response, {
			async onCompletion(completion) {
				sendAnalytics(EventName.ConversationHit, {
					interviewId: json.interview.id,
					organizationId: json.interview.organizationId,
					studyId: json.interview.studyId,
				});

				const endInterview = completion.includes(endInterviewDelimiter);
				if (endInterview) {
					// End interview
					logger.info(
						{
							interviewId: json.interview.id,
						},
						`Interview completed, sending 'api/interview.completed' event`
					);

					await emitProcessInterview({
						interviewId: json.interview.id,
						studyId: json.interview.studyId,
					});
				}
			}
		});

		return new StreamingTextResponse(stream);
	} else {
		// End interview
		logger.info(
			{
				interviewId: json.interview.id,
			},
			`Interview completed, sending 'api/interview.completed' event`
		);

		await emitProcessInterview({
			interviewId: json.interview.id,
			studyId: json.interview.studyId,
		});

		const emptyStream = getEmptyStreamMessage();
		return new StreamingTextResponse(emptyStream);
	}
}

const getEmptyStreamMessage = (): ReadableStream => {
	const stream = new ReadableStream({
		start(controller) {
			controller.close();
		}
	});

	return stream;
}
