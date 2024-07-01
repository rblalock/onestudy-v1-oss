"use client"

import * as React from "react"
import { SliderProps } from "@radix-ui/react-slider"

import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/frontend/components/ui/hover-card"
import { Label } from "@/frontend/components/ui/label"
import { Slider } from "@/frontend/components/ui/slider"

interface NumberOfQuestionsSelectorProps {
	defaultValue: SliderProps["defaultValue"];
	onCommit?: (value: number) => void;
}

export function NumberOfQuestionsSelector(props: NumberOfQuestionsSelectorProps) {
	const [value, setValue] = React.useState(props.defaultValue)

	const handleCommit = (val: number[]) => {
		props.onCommit?.(val[0]);
	};

	const handleChange = (val: number[]) => {
		setValue(val)
	};

	return (
		<div className="grid gap-2">
			<HoverCard openDelay={200}>
				<HoverCardTrigger asChild>
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<Label htmlFor="maxlength" className="text-xs">Limit 25</Label>
							<span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
								{value}
							</span>
						</div>
						<Slider
							id="maxlength"
							max={25}
							min={1}
							defaultValue={value}
							step={1}
							onValueChange={handleChange}
							onValueCommit={handleCommit}
							className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
							aria-label="Maximum Length"
						/>
					</div>
				</HoverCardTrigger>
				<HoverCardContent
					align="start"
					className="w-[260px] text-sm"
					side="bottom"
				>
					The maximum number of follow-up questions a participant will be asked.
				</HoverCardContent>
			</HoverCard>
		</div>
	)
}