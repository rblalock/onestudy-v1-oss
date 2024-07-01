import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";

import { endInterviewDelimiter } from "@/core/ai/utils";
import { GPTMessage } from "@/core/types";
import { conversation } from "@/server/ai/conversation";
import { EventName, sendAnalytics } from "@/server/analytics";
import { updateInterview } from "@/server/edgeData/interview";
import { emitProcessInterview } from "@/server/events/interview";
import logger from "@/server/utils/logger";
import { conversationRateLimit } from "@/server/utils/rate-limit";

export const config = {
  runtime: "edge",
};

export default async function interviewConversationApi(
  req: NextRequest,
  res: NextResponse,
) {
  const json = await req.json();

  // Rate limit check
  const { success } = await conversationRateLimit.limit(json.interview.id);
  if (!success) {
    return NextResponse.json(
      { message: "Rate limit exceeded" },
      { status: 429 },
    );
  }

  // Store current conversation in cache
  updateInterview(json.interview.id, json.messages);

  const messages: GPTMessage[] = json.messages || [];
  const endOfInterviewMessage = messages.find((message: GPTMessage) =>
    message.content.includes(endInterviewDelimiter),
  );

  if (json.questionsLeft > 0 || !endOfInterviewMessage) {
    const response = await conversation({
      messages: json.messages || [],
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
            `Interview completed, sending 'api/interview.completed' event`,
          );

          await emitProcessInterview({
            interviewId: json.interview.id,
            studyId: json.interview.studyId,
          });
        }
      },
    });

    return new StreamingTextResponse(stream);
  } else {
    // End interview
    logger.info(
      {
        interviewId: json.interview.id,
      },
      `Interview completed, sending 'api/interview.completed' event`,
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
    },
  });

  return stream;
};
