import { useRouter } from 'next/router';

import InterviewNav from '@/frontend/components/Interview/InterviewNav';
import InterviewPage from "@/frontend/components/Interview/InterviewPage";
import LayoutMain from '@/frontend/components/Layout/Main';

const InterviewDetail = () => {
	const router = useRouter();
	const interviewId = router.query.interview_id as string | undefined;

	return (
		<LayoutMain>
			<div className="grid flex-1 gap-12 lg:grid-cols-[200px_1fr]">
				<aside className="w-[200px] flex-col lg:flex">
					<InterviewNav />
				</aside>
				<main className="flex w-full flex-1 flex-col overflow-hidden">
					<InterviewPage interviewId={interviewId} />
				</main>
			</div>
		</LayoutMain>
	);
};

export default InterviewDetail;
