import { useRouter } from "next/router";

import LayoutMain from "@/frontend/components/Layout/Main";
import Insights from "@/frontend/components/Study/Insights";
import StudyNav from "@/frontend/components/Study/StudyNav";
import useStudy from "@/frontend/hooks/studies/useStudy";

const InsightsOverview = () => {
	const router = useRouter();
	const studyId = router.query.study_id as string | undefined;
	const { data, isLoading, isError } = useStudy(studyId);

	return (
		<LayoutMain>
			<div className="space-y-0.5">
				<h2 className="text-2xl">
					{data?.name || ' '}
				</h2>
			</div>

			<hr className="my-6 dark:border-slate-800" />

			{/* {isLoading && <div>Loading...</div>}
			{isError && <div>Whoops!</div>} */}

			<div className="grid flex-1 gap-12 lg:grid-cols-[200px_1fr]">
				<aside className="w-[200px] flex-col lg:flex">
					<StudyNav />
				</aside>
				<main className="flex w-full flex-1 flex-col overflow-hidden">
					<Insights study={data} />
				</main>
			</div>
		</LayoutMain>
	);
};

export default InsightsOverview;
