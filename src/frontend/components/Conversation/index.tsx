'use client'

import { useChat } from "ai/react"
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import Markdown from 'react-markdown'

import { endInterviewDelimiter } from "@/core/ai/utils";
import { InterviewCache } from "@/core/interviews/types";
import { GPTMessageWithID } from "@/core/types";
import RightArrowButton from "@/frontend/components/Buttons/RightArrow";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";

const mainColor = "#3752dc";

const ConversationWrapper = (props: {
	interview?: Partial<InterviewCache>;
}) => {
	const firstQuestion = props.interview?.study?.meta?.firstQuestion;
	const [questionsLeft, setQuestionsLeft] = useState(props.interview?.study?.meta?.followUpQuestionNumber || 5);
	const { messages, append, input, handleInputChange, handleSubmit, isLoading } = useChat({
		api: '/api/conversation/interview',
		id: props.interview?.id,
		initialMessages: [
			...props.interview?.rawMessages as GPTMessageWithID[] || [], 
			{ role: 'assistant', content: firstQuestion, id: '1' }
		],
		body: {
			interview: props.interview,
			questionsLeft
		},
		onFinish: (message) => {
			const endInterview = message.content.includes(endInterviewDelimiter);
			if (endInterview) {
				setQuestionsLeft(-2);
			} else {
				setQuestionsLeft(questionsLeft - 1);
			}
		}
	});

	const handleInARush = () => {
		setQuestionsLeft(questionsLeft - 1);
		append({
			role: 'user',
			content: 'I am in a rush, can we wrap this up with the last question?',
			id: 'in-a-rush'
		});
	};

	return (
		<>
			<div className="w-full h-1 bg-gray-200 fixed top-0 left-0">
				<div
					className="h-1 transition-all duration-500 ease-in-out"
					style={{ 
						width: `${((5 - questionsLeft) / 5) * 100}%`,
						backgroundColor: props.interview?.study?.meta?.primaryColor || mainColor
					}}
				/>
			</div>
			<div className="w-full lg:w-1/3">
				{questionsLeft > -1 ? (
					<>
						<div className="mb-10">
							{messages
								.slice()
								.reverse()
								.filter((m, i) => m.role !== 'user')
								.slice(0, 1)
								.map(m => (
									<p key={m.id} className="px-5 text-lg lg:text-2xl lg:font-bold dark:text-gray-200 text-black">
										{m?.content?.replace(endInterviewDelimiter, '')}
									</p>
								))
							}
						</div>

						<div className="grid w-full gap-2">
							<form onSubmit={handleSubmit} className="w-full flex-col justify-center items-center">
								<Textarea
									id="prompt"
									name="prompt"
									value={input}
									placeholder="Type your response..."
									onChange={handleInputChange}
									className="mb-5 w-full bg-gray-100 dark:bg-stone-900 dark:text-white"
								/>
								<div className="flex justify-center w-full">
									<Button type="submit" size="lg" disabled={isLoading}>
										Submit response
									</Button>
								</div>
							</form>
						</div>

						<div className="absolute bottom-0 right-0 mr-3 mb-3 z-10">
							<RightArrowButton
								message="in a rush?"
							onClick={handleInARush}
							/>
						</div>
					</>
				) : (
					<TheEnd 
						interview={props.interview}
					/>
				)}
			</div>
		</>
	);
};

const TheEnd = (props: {
	interview?: Partial<InterviewCache>;
}) => {
	const { register, handleSubmit, setValue, formState: { errors } } = useForm();

	// const handleRegisterFollowupEmail = async (data: FieldValues) => {
	// 	console.log(data, props.cachedInterviewId);
	// };

	return (
		<div className="flex w-full flex-1 flex-col items-center space-y-10">
			<div
				className={
					'mb-5 flex flex-col space-y-1 md:w-full text-center text-black text-2xl lg:text-4xl font-semibold dark:text-gray-200'
				}
			>
				<Markdown className="prose dark:prose-invert">
					{props.interview?.study?.meta?.farewellMessage || 'You have completed the interview.  Thank you for your time!'}
				</Markdown>
			</div>

			{/* <div className="border-t pt-10 text-xl text-center lg:w-4/5">
				In some cases, we may have additional questions to your entries. If you would be willing to schedule a follow-up, please confirm the information below. 
			</div> */}

			{/* <form className="w-2/5" onSubmit={handleSubmit(handleRegisterFollowupEmail)}>
				<div className="flex flex-col space-y-4 mb-10 text-left">
					<Label>
						Email address:
						<Input
							className={'w-full mt-2 bg-gray-100'}
							type="email"
							{...register("followupEmail")}
						/>
					</Label>
				</div>

				<div className={'flex justify-center space-x-2 w-full'}>
					<Button
						size="lg"
						className={'flex justify-center mx-auto'}
						type="submit"
					>
						<span className="flex items-center space-x-2 text-xl">
							<span>
								I'm interested
							</span>
						</span>
					</Button>
				</div>
			</form> */}
		</div>
	);
};

export default ConversationWrapper;
