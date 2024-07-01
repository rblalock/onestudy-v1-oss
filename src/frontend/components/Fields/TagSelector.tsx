import { PlusIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { useForm, } from "react-hook-form";

import { generateRandomColor } from "@/core/utils/color";

import { PopoverPicker } from "../PopoverPicker";
import { Button } from "../ui/button";
import { Input } from "../ui/input";


export default function TagSelector(props: {
	onTagSelection: (payload: {
		tag: string;
		color: string;
	}) => void;
}) {
	const { register, handleSubmit, formState: { errors } } = useForm();
	const [color, setColor] = useState(generateRandomColor());

	const handleColorChange = (color: string) => {
		setColor(color);
	}
	
	const onTagCreation = async (payload: any) => {
		props.onTagSelection({
			tag: payload.tag,
			color: color,
		});
	};

	return (
		<form onSubmit={handleSubmit(onTagCreation)} className="flex">
			<div className="relative mr-1">
				<Input
					className=""
					placeholder="Enter a name"
					{...register('tag', { required: true })}
				/>
				{errors.tag && <span className="text-xs text-red-500">This field is required</span>}

				<div className="absolute right-2 top-2.5 cursor-pointer">
					<PopoverPicker color={color} onChange={handleColorChange} />
				</div>
			</div>

			<Button type="submit" variant="secondary" size="default" className="">
				<PlusIcon className="h-4 w-4 mr-1" />
				Add
			</Button>
		</form>
	);
};
