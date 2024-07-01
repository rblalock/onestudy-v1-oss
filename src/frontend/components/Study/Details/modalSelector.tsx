"use client"

import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/frontend/components/ui/hover-card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/frontend/components/ui/select";

export function ModalSelector(props: {
	defaultValue?: string;
	onChange?: (value: "Enabled" | "Disabled") => void;
}) {
	const onValueChange = (value: "Enabled" | "Disabled") => {
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
									placeholder={props.defaultValue || 'Disabled'}
									defaultValue={props.defaultValue || 'Disabled'}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel className="text-xs">
										Audio transcription
									</SelectLabel>
									<SelectItem value="Enabled">Enabled</SelectItem>
									<SelectItem value="Disabled">Disabled</SelectItem>
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
					Enable to allow the respondent to record their voice and transcribe it to text.
				</HoverCardContent>
			</HoverCard>
		</div>
	)
}