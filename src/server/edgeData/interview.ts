import { nanoid } from "nanoid";
import { ChatCompletionRequestMessageRoleEnum } from "openai-edge";

import { endInterviewPrompt } from "@/core/ai/utils";
import { InterviewCache } from "@/core/interviews/types";
import { Study } from "@/core/studies/types";
import { interviewerStyles } from "@/core/studies/utils";
import { GPTMessage } from "@/core/types";
import { emitScheduleInterviewCheck } from "@/server/events/interview";

import { edgeDbClient } from "./connection";

export const getInterview = async (id: string) => {
  const interviewKey = `interview:${id}`;
  const interview = await edgeDbClient.json.get(interviewKey, "$");

  if (!interview) {
    return;
  }

  return interview?.[0] as InterviewCache;
};

export const startInterview = async (
  studyId: string,
  study: Partial<Study> = {},
  userMetaData: { [key: string]: any } = {},
  messages?: GPTMessage[],
) => {
  const id = nanoid();
  const interviewKey = `interview:${id}`;

  // Grab the interviewer style from the study
  const interviewerType = study.interviewerStyle || interviewerStyles[0].name;
  let interviewerTypeRecord = interviewerStyles.find(
    (i) => i.name === interviewerType,
  );
  if (!interviewerTypeRecord) {
    interviewerTypeRecord = interviewerStyles[0];
  }

  let interviewerContent: string;
  if (interviewerType === "Custom") {
    interviewerContent = interviewerTypeRecord.instructions(
      study,
      study.interviewerStyleCustomMessage,
    );
  } else {
    interviewerContent = interviewerTypeRecord.instructions(study);
  }

  // Hardcoded prompt instructions
  interviewerContent += `\n\n${endInterviewPrompt}`;

  const payload: InterviewCache = {
    studyId,
    study,
    userMetaData,
    rawMessages: [
      {
        id: "0",
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: interviewerContent,
      },
    ],
    id,
  };

  if (messages) {
    payload.rawMessages.push(...messages);
  }

  const result = await edgeDbClient.json.set(interviewKey, "$", payload);

  if (result !== "OK") {
    throw new Error(
      `Failed to save interview for study: ${studyId}, with generated ID ${id}`,
    );
  }

  // Schedule a time to check for stale interviews
  emitScheduleInterviewCheck({ interviewId: id, studyId });

  return {
    id,
    interviewKey,
  };
};

export const updateInterview = async (
  interviewId: string,
  messages: { [key: string]: any }[],
) => {
  const interviewKey = `interview:${interviewId}`;
  const result = await edgeDbClient.json.set(
    interviewKey,
    "$.rawMessages",
    messages,
  );

  if (result === null) {
    throw new Error(
      `Failed to update interview for interviewId: ${interviewId}`,
    );
  }

  return result;
};

export const deleteInterview = async (interviewId: string) => {
  const interviewKey = `interview:${interviewId}`;
  const result = await edgeDbClient.json.del(interviewKey);

  if (result === null) {
    throw new Error(
      `Failed to delete interview for interviewId: ${interviewId}`,
    );
  }

  return result;
};
