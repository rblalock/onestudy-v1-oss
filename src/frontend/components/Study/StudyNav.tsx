import { LightBulbIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { ArrowUpRightSquare, FileSignature, SquareGantt } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"
import { useRouter } from "next/router";

import { Button } from "@/frontend/components/ui/button";

const StudyNav = () => {
	const router = useRouter();
	const studyId = router.query.study_id as string | undefined;
	const pathname = usePathname();

	return (
		<nav className="flex flex-col items-start lg:space-x-0 border-r dark:border-slate-800">
			<div className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 w-full text-sm pr-3">
				<Link
					href={`/studies/${studyId}/details`}
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== `/studies/${studyId}/details`) ? "ghost" : "secondary"}
						size="sm"
					>
						<FileSignature className="mr-3 h-5 w-5" /> Study Setup
					</Button>
				</Link>

				<Link
					href={`/studies/${studyId}/synthesis`}
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== `/studies/${studyId}/synthesis`) ? "ghost" : "secondary"}
						size="sm"
					>
						<LightBulbIcon className="mr-3 h-5 w-5" /> Synthesis
					</Button>
				</Link>

				<Link
					href={`/studies/${studyId}/insights`}
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== `/studies/${studyId}/insights`) ? "ghost" : "secondary"}
						size="sm"
					>
						<MagnifyingGlassIcon className="mr-3 h-5 w-5" /> Insights
					</Button>
				</Link>

				<Link
					href={`/studies/${studyId}/share`}
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== `/studies/${studyId}/share`) ? "ghost" : "secondary"}
						size="sm"
					>
						<ArrowUpRightSquare className="mr-3 h-5 w-5" /> Share
					</Button>
				</Link>

				<Link
					href={`/studies/${studyId}`}
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== `/studies/${studyId}`) ? "ghost" : "secondary"}
						size="sm"
					>
						<SquareGantt className="mr-3 h-5 w-5" /> Interviews
					</Button>
				</Link>
			</div>
		</nav>
	);
};

export default StudyNav;
