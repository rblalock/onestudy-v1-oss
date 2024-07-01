"use client";

import { LightningBoltIcon } from "@radix-ui/react-icons";
import Markdown from "react-markdown";

import { Study } from "@/core/studies/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/frontend/components/ui/accordion";
import { Button } from "@/frontend/components/ui/button";
import { DataTable } from "@/frontend/components/ui/data-table/data-table";
import { toast } from "@/frontend/components/ui/use-toast";
import useSummarize, {
  SummaryType,
} from "@/frontend/hooks/general/useSummarize";
import useListInterviews from "@/frontend/hooks/interviews/useListInterviews";
import { useAnalytics } from "@/frontend/lib/analytics";

import { columns } from "./InterviewsTable/columns";
import { DataTableToolbar } from "./InterviewsTable/toolbar";

const OverviewDetails = (props: { study?: Study }) => {
  const { logEvent } = useAnalytics();
  const { data, isLoading, isError } = useListInterviews(props.study?.id);
  const { mutateAsync } = useSummarize();

  // const regenerateSummary = async () => {
  // 	if (!props.study?.id) { return; }

  // 	const results = await mutateAsync({
  // 		id: props.study?.id,
  // 		type: SummaryType.Study,
  // 	});

  // 	if (results.success) {
  // 		toast({
  // 			description: `Creating a summary which will be available shortly.`,
  // 			duration: 15000,
  // 		});
  // 		logEvent('study_overview_summary_regenerate', { studyId: props.study?.id });
  // 	} else {
  // 		toast({
  // 			description: `Summary failed to generate, try again later please.`,
  // 			variant: "destructive"
  // 		});
  // 		logEvent('study_overview_summary_regenerate_failed', { studyId: props.study?.id });
  // 	}
  // };

  if (!props.study || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {/* {props.study.summary ? (
				<Accordion type="single" collapsible className="w-full mb-5">
					<AccordionItem value="item-1" className="dark:border-slate-700">
						<AccordionTrigger className="text-xl underline">
							Study summary
						</AccordionTrigger>
						<AccordionContent>

							<Markdown className="prose dark:prose-invert">{props.study.summary}</Markdown>

							<div />
							<Button variant="outline" className="mt-5" onClick={regenerateSummary}>
								<LightningBoltIcon className="w-4 h-4 mr-2" />
								Re-create summary
							</Button>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			) : null} */}

      {/* {!props.study?.summary && data?.length > 0 ? (
				<Button variant="outline" className="mb-5" onClick={regenerateSummary}>
					<LightningBoltIcon className="w-4 h-4 mr-2" />
					Create summary
				</Button>
			) : null} */}

      <DataTable
        columns={columns}
        // @ts-ignore
        data={data}
        toolbar={(table) => <DataTableToolbar table={table} />}
      />
    </div>
  );
};

export default OverviewDetails;
