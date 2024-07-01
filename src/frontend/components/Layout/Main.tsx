import Link from "next/link"

import { cn } from "@/frontend/lib/utils"
import { MainNav } from "@/frontend/components/Layout/MainNav";
import Footer from "@/frontend/components/Layout/Footer";

export default function LayoutMain({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) {
	return (
		<>
			<div
				className={cn("flex min-h-screen flex-col space-y-6", className)}
				{...props}
			>
				<MainNav />

				<div className="container">
					{props.children}
				</div>
			</div>
			<Footer />
		</>
	)
}