import Image from "next/image";
import Link from "next/link";

import DarkLogo from "$/assets/icons/logo_dark.svg"
import WhiteLogo from "$/assets/icons/logo_white.svg"

export const MainLogo = () => {
	return (
		<Link className="items-center space-x-1 flex" href="/">
			<Image
				priority
				src={DarkLogo}
				alt="One Study - Human Research"
				className="w-40 block dark:hidden"
			/>
			<Image
				priority
				src={WhiteLogo}
				alt="One Study - Human Research"
				className="w-40 hidden dark:block"
			/>
		</Link>
	)
};
