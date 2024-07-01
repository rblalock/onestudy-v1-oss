import { useRouter } from "next/router";

import LayoutMain from "@/frontend/components/Layout/Main";
import StudyNav from "@/frontend/components/Study/StudyNav";
import SynthesisComponent from "@/frontend/components/Study/Synthesis";

const SynthesisPage = () => {
	const router = useRouter();
	const studyId = router.query.study_id as string | undefined;

	return (
		<LayoutMain>
			<div className="space-y-0.5">
				<h2 className="text-2xl">
					Study synthesis
				</h2>
			</div>

			<hr className="my-6 dark:border-slate-800" />

			<div className="grid flex-1 gap-12 lg:grid-cols-[200px_1fr]">
				<aside className="w-[200px] flex-col lg:flex">
					<StudyNav />
				</aside>
				<main className="flex w-full flex-1 flex-col overflow-hidden">
					<SynthesisComponent studyId={studyId} />
				</main>
			</div>
		</LayoutMain>
	);
};

export default SynthesisPage;