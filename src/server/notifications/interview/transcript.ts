import { ChatCompletionRequestMessageRoleEnum } from "openai-edge";

import { interviewRoleLabelTransform } from "@/core/interviews/utils";
import { getInterview } from "@/server/data/interview";

import { sendEmail } from "../email";

if (!process.env.MAIL_TRANSACTIONAL_ID) {
  console.error("MAIL_TRANSACTIONAL_ID is not set");
}
export const transactionalId = process.env.MAIL_TRANSACTIONAL_ID;

export const sendTranscriptionEmail = async (
  interviewId: string,
  email: string
) => {
  const interview = await getInterview(interviewId);
  const messages = interview?.rawMessages
    ?.filter((m: any) => m.role !== ChatCompletionRequestMessageRoleEnum.System)
    .map((r: any) => {
      return `
				<strong>${interviewRoleLabelTransform(r.role)}</strong>
				<br />
				<p>${r.content}</p>
				<br />
			`;
    })
    .join("\n");

  return sendEmail({
    transactionalId,
    email: email,
    dataVariables: {
      full_transcript: messages,
    },
  });
};
