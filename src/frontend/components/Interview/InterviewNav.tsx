import { usePathname } from "next/navigation"
import Link from "next/link";

import { Button } from "@/frontend/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";

const InterviewNav = () => {
	const router = useRouter();
	const studyId = router.query.study_id as string | undefined;
	const pathname = usePathname();

	return (
		<nav className="flex flex-col items-start lg:space-x-0 border-r dark:border-slate-800">
			<div className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 w-full text-sm pr-3">
				<Link
					href={`/studies/${studyId}`}
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== `/studies/${studyId}`) ? "ghost" : "secondary"}
						size="sm"
					>
						<ArrowLeftIcon className="mr-3 h-5 w-5" /> Go to study
					</Button>
				</Link>
			</div>
		</nav>
	);
};

export default InterviewNav;
