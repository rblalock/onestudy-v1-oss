import React, { useCallback, useRef, useState, RefObject } from "react";
import { HexColorPicker } from "react-colorful";

import useClickOutside from "../../hooks/general/useOutside";

interface PopoverPickerProps {
	color: string;
	onChange: (color: string) => void;
}

export const PopoverPicker = ({ color, onChange }: PopoverPickerProps) => {
	const popover = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	const close = useCallback(() => setIsOpen(false), []);
	useClickOutside(popover, close);

	return (
		<div className="picker">
			<div
				className="swatch"
				style={{ backgroundColor: color }}
				onClick={() => setIsOpen(true)}
			/>

			{isOpen && (
				<div className="popover" ref={popover}>
					<HexColorPicker color={color} onChange={onChange} />
				</div>
			)}
		</div>
	);
};
