import Image from 'next/image';

import RightArrow from "$/assets/icons/corner-up-right.svg"

export default function RightArrowButton (props: {
	message: string;
	onClick?: () => void;
}) {
	return (
		<div 
			className="text-black dark:text-white font-bold group cursor-pointer border dark:border-zinc-600 rounded-full p-2 flex items-center group-hover:border-black dark:group-hover:border-zinc-400 transition-all duration-300"
			onClick={props.onClick}
		>
			<div 
				className="mx-2 hidden group-hover:block"
			>
				{props.message}
			</div>

			<Image
				priority
				src={RightArrow}
				alt="in a rush?"
				className=""
			/>
		</div>
	);
}
