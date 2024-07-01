"use client"

import { StudyStatus } from "@/core/studies/types";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/frontend/components/ui/hover-card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/frontend/components/ui/select";

export function StudyStatusSelector(props: {
	defaultValue?: StudyStatus;
	onChange?: (value: StudyStatus) => void;
}) {
	const onValueChange = (value: StudyStatus) => {
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
									placeholder={props.defaultValue || StudyStatus.INACTIVE}
									defaultValue={props.defaultValue || StudyStatus.INACTIVE} 
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel className="text-xs">
										Update status to:
									</SelectLabel>
									<SelectItem value={StudyStatus.COMPLETED}>Completed</SelectItem>
									<SelectItem value={StudyStatus.INACTIVE}>Inactive</SelectItem>
									<SelectItem value={StudyStatus.ACTIVE}>Active</SelectItem>
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
					Change the status of the study (It needs to be "active" to share the link)
				</HoverCardContent>
			</HoverCard>
		</div>
	)
}