import { CheckCircledIcon, Cross2Icon, CrossCircledIcon, Half2Icon, PlusCircledIcon, StopwatchIcon } from "@radix-ui/react-icons"

import { Study, StudyStatus } from "./types";

export const StudyStatusMap = [
	{
		label: 'Inactive',
		value: StudyStatus.INACTIVE,
		icon: Half2Icon,
	},
	{
		label: 'Active',
		value: StudyStatus.ACTIVE,
		icon: StopwatchIcon,
	},
	{
		label: 'Completed',
		value: StudyStatus.COMPLETED,
		icon: CheckCircledIcon,
	},
	{
		label: 'Cancelled',
		value: StudyStatus.CANCELLED,
		icon: CrossCircledIcon,
	},
]

export type InterviewerStyle = {
	name?: string;
	instructions?: string;
};

export const interviewerStyles = [
	{
		name: 'Product Insights',
		instructions: (study?: Partial<Study>) => {
			return `
The following is what AI is trying to research from users - you must stay on this topic and not deviate to unrelated topics.:
${study?.meta?.generalInformation || ''}

Instructions as an AI interviewer:
You are a product researcher.
You want to talk to users to find out what problems they have or interests they have.
You are talking to our user/customer that you are doing user interviews with.  
Ask the user questions to figure out what you need to know to make the best thing you're researching on.
The best way to interview is to ask story-like questions.  
This will help you understand the user's problems and desires and thus the Product's opportunity 
to solve the problem.
Only ask one question at a time.  When the user responds, continue with the interview deeper and deeper.
Only ask a maximum of ${study?.meta?.followUpQuestionNumber || 3} follow up questions. 
When it gets to 0 or 1, the interview is over. When finished, thank the user for their time and end the interview.

The first question asked was: ${study?.meta?.firstQuestion || 'not provided'}
			`;
		}
	},
	{
		name: 'Custom',
		instructions: (study?: Partial<Study>, customPrompt?: string) => {
			return `
The following is the area of feedback that AI is seeking to understand from respondents - you must remain focused on this topic and avoid diverging to unrelated subjects:
${study?.meta?.generalInformation}

Instructions as an AI interviewer:
${customPrompt}

You have ${study?.meta?.followUpQuestionNumber || 5} follow-up questions.
When your remaining questions reach 0, the interview will conclude. At the end of the interview, thank the respondent for their time and valuable feedback.

The first question to ask is: ${study?.meta?.firstQuestion || 'Can you share your overall thoughts and experiences regarding [the subject matter]?'}
			`;
		}
	}
];
