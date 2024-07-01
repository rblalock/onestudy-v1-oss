import { CheckCircledIcon, CircleIcon, CrossCircledIcon, StopwatchIcon } from "@radix-ui/react-icons"
import { ChatCompletionRequestMessageRoleEnum } from "openai-edge";

import { InterviewStatus } from "@/core/interviews/types"

export const InterviewStatusMap = [
	{
		value: InterviewStatus.NOT_STARTED,
		label: InterviewStatus.NOT_STARTED,
		icon: CircleIcon,
	},
	{
		value: InterviewStatus.IN_PROGRESS,
		label: InterviewStatus.IN_PROGRESS,
		icon: StopwatchIcon,
	},
	{
		value: InterviewStatus.COMPLETED,
		label: InterviewStatus.COMPLETED,
		icon: CheckCircledIcon,
	},
	{
		value: InterviewStatus.CANCELLED,
		label: InterviewStatus.CANCELLED,
		icon: CrossCircledIcon,
	},
]

export const interviewRoleLabelTransform = (role: ChatCompletionRequestMessageRoleEnum) => {
	if (role === ChatCompletionRequestMessageRoleEnum.Assistant) {
		return 'Question';
	}

	if (role === ChatCompletionRequestMessageRoleEnum.User) {
		return 'Response';
	}

	return role;
};
