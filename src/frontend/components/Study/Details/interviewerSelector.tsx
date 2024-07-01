"use client"

import { interviewerStyles } from "@/core/studies/utils";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/frontend/components/ui/hover-card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/frontend/components/ui/select";


export function InterviewerSelector(props: {
	defaultValue?: string;
	onChange?: (value: string) => void;
}) {
	const onValueChange = (value: string) => {
		props.onChange?.(value);
	};

	return (
		<div className="grid gap-2">
			<HoverCard openDelay={200}>
				<HoverCardTrigger asChild>
					<div>
						<Select onValueChange={onValueChange}>
							<SelectTrigger className="text-xs">
								<SelectValue 
									placeholder={props.defaultValue || "Select a type"}
									defaultValue={props.defaultValue || interviewerStyles[0].name} 
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel className="text-xs">
										Interviewer Style
									</SelectLabel>
									{interviewerStyles.map((r) => (
										<SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</HoverCardTrigger>
				<HoverCardContent
					align="start"
					className="w-[260px] text-sm"
					side="bottom"
				>
					Choose the interviewer style that fits your study.
				</HoverCardContent>
			</HoverCard>
		</div>
	)
}