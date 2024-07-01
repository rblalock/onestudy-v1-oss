import { LightningBoltIcon } from "@radix-ui/react-icons";
import { PaintBucket, Quote, Wand2 } from "lucide-react";
import Markdown from "react-markdown";

import { Study } from "@/core/studies/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs"
import useSummarize, { SummaryType } from "@/frontend/hooks/general/useSummarize";
import useStudy from "@/frontend/hooks/studies/useStudy";
import { useAnalytics } from "@/frontend/lib/analytics";

import { Button } from "../../ui/button";
import { toast } from "../../ui/use-toast";
import { useState } from "react";


const SynthesisComponent = (props: {
	studyId?: string;
}) => {
	const { data, isLoading, isError } = useStudy(props.studyId);

	return (
		<div className="w-full">
			{/* Menu */}
			<div>
				<Tabs defaultValue="abstract" className="w-full">
					<TabsList className="w-full justify-center space-x-40">
						<TabsTrigger value="abstract">Study Abstract</TabsTrigger>
						<TabsTrigger value="themes">Themes & Insights</TabsTrigger>
						<TabsTrigger value="quotes">Quotes</TabsTrigger>
					</TabsList>
					<TabsContent value="abstract">
						<Abstract study={data} />
					</TabsContent>
					<TabsContent value="themes">
						<Themes study={data} />
					</TabsContent>
					<TabsContent value="quotes">
						<Quotes study={data} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default SynthesisComponent;

const Abstract = (props: {
	study?: Study;
}) => {
	const { logEvent } = useAnalytics();
	const { mutateAsync } = useSummarize();
	const [isLoading, setIsLoading] = useState(false);

	const regenerateSummary = async () => {
		if (!props.study?.id) { return; }

		const results = await mutateAsync({
			id: props.study?.id,
			type: SummaryType.Study,
		});

		if (results.success) {
			setIsLoading(true);
			setTimeout(() => {
				setIsLoading(false);
				window.location.reload();
			}, 20000);

			toast({
				description: `Creating a summary which will be available shortly.`,
				duration: 15000,
			});
			logEvent('study_synthesis_abstract_regenerate', { studyId: props.study?.id });
		} else {
			toast({
				description: `Summary failed to generate, try again later please.`,
				variant: "destructive"
			});
			logEvent('study_synthesis_abstract_regenerate_failed', { studyId: props.study?.id });
		}
	};

	return (
		<div>
			{/* AI controls */}
			<div className="flex items-center mb-10">
				<Button disabled={isLoading} variant="outline" className="mt-5" onClick={regenerateSummary}>
					<LightningBoltIcon className="w-4 h-4 mr-2" />
					{isLoading ? `Generating...` : `Generate an abstract`}
				</Button>
			</div>

			<div>
				<Markdown className="prose prose-headings:text-2xl dark:prose-invert">
					{props.study?.summary || `No summary available.`}
				</Markdown>
			</div>
		</div>
	)
};

const Themes = (props: {
	study?: Study;
}) => {
	const { logEvent } = useAnalytics();
	const { mutateAsync } = useSummarize();
	const [isLoading, setIsLoading] = useState(false);

	const regenerateSummary = async () => {
		if (!props.study?.id) { return; }

		const results = await mutateAsync({
			id: props.study?.id,
			type: SummaryType.Themes,
		});

		if (results.success) {
			setIsLoading(true);
			setTimeout(() => {
				setIsLoading(false);
				window.location.reload();
			}, 50000);
			toast({
				description: `Creating a summary which will be available shortly.`,
				duration: 15000,
			});
			logEvent('study_synthesis_theme_regenerate', { studyId: props.study?.id });
		} else {
			toast({
				description: `Summary failed to generate, try again later please.`,
				variant: "destructive"
			});
			logEvent('study_synthesis_theme_regenerate_failed', { studyId: props.study?.id });
		}
	};

	return (
		<div>
			{/* AI controls */}
			<div className="flex items-center mb-10">
				<Button disabled={isLoading} variant="outline" className="mt-5" onClick={regenerateSummary}>
					<PaintBucket className="w-4 h-4 mr-2" />
					{isLoading ? `Generating...` : `Get themes & insights`}
				</Button>
			</div>

			<div>
				{/* <h2 className="text-4xl font-bold mb-3">Themes</h2> */}
				<Markdown className="prose prose-headings:text-2xl dark:prose-invert mb-3">
					{props.study?.meta?.themes?.response?.explanation
						? convertIdsToLinks(
							props.study?.meta?.themes?.response?.explanation,
							props.study?.meta?.themes?.response?.documentReferenceIds || [],
							props.study?.id || ''
						) : `No themes available.`}
				</Markdown>

				<hr className="w-full border my-10 dark:border-slate-900 border-slate-200" />

				{/* <h2 className="text-4xl font-bold mb-3">Insights</h2> */}
				<Markdown className="prose prose-headings:text-2xl dark:prose-invert mb-10">
					{props.study?.meta?.insights?.response?.explanation
						? convertIdsToLinks(
							props.study?.meta?.insights?.response?.explanation,
							props.study?.meta?.insights?.response?.documentReferenceIds || [],
							props.study?.id || ''
						) : `No insights available.`}
				</Markdown>
			</div>
		</div>
	)
};

const Quotes = (props: {
	study?: Study;
}) => {
	const { logEvent } = useAnalytics();
	const { mutateAsync } = useSummarize();
	const [isLoading, setIsLoading] = useState(false);

	const regenerateSummary = async () => {
		if (!props.study?.id) { return; }

		const results = await mutateAsync({
			id: props.study?.id,
			type: SummaryType.Quotes,
		});

		if (results.success) {
			setIsLoading(true);
			setTimeout(() => {
				setIsLoading(false);
				window.location.reload();
			}, 50000);
			toast({
				description: `Creating a summary which will be available shortly.`,
				duration: 15000,
			});
			logEvent('study_synthesis_quote_regenerate', { studyId: props.study?.id });
		} else {
			toast({
				description: `Summary failed to generate, try again later please.`,
				variant: "destructive"
			});
			logEvent('study_synthesis_quote_regenerate_failed', { studyId: props.study?.id });
		}
	};

	return (
		<div>
			{/* AI controls */}
			<div className="flex items-center mb-10">
				<Button disabled={isLoading} variant="outline" className="mt-5" onClick={regenerateSummary}>
					<Quote className="w-4 h-4 mr-2" />
					{isLoading ? `Generating...` : `Get thematic & notable quotes`}
				</Button>
			</div>

			<div>
				<Markdown className="prose prose-headings:text-2xl dark:prose-invert mb-3">
					{props.study?.meta?.thematicQuotes?.response?.explanation
						? convertIdsToLinks(
							props.study?.meta?.thematicQuotes?.response?.explanation,
							props.study?.meta?.thematicQuotes?.response?.documentReferenceIds || [],
							props.study?.id || ''
						) : `No thematic quotes available.`}
				</Markdown>

				<hr className="w-full border my-10 dark:border-slate-900 border-slate-200" />

				<Markdown className="prose prose-headings:text-2xl dark:prose-invert mb-10">
					{props.study?.meta?.notableQuotes?.response?.explanation
						? convertIdsToLinks(
							props.study?.meta?.notableQuotes?.response?.explanation,
							props.study?.meta?.notableQuotes?.response?.documentReferenceIds || [],
							props.study?.id || ''
						) : `No notable quotes available.`}
				</Markdown>
			</div>
		</div>
	)
};

const convertIdsToLinks = (
	text: string,
	documentReferenceIDs: string[],
	studyId: string
): string => {
	if (documentReferenceIDs.length === 0) {
		return text;
	}

	const idRegex = new RegExp(documentReferenceIDs.join('|'), 'g');
	return text.replace(idRegex, (matchedId) => `[interview link](/studies/${studyId}/interview/${matchedId})`);
}
