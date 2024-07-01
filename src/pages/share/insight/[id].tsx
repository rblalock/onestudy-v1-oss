import { useAuth } from "@clerk/nextjs";
import { Link2Icon } from "@radix-ui/react-icons";
import { ArrowBigRight } from "lucide-react";
import { GetServerSidePropsContext } from "next";
import Head from 'next/head';
import Link from "next/link";
import Markdown from "react-markdown";

import { MainLogo } from "@/frontend/components/Logo";
import { Button } from "@/frontend/components/ui/button";
import { ModeToggle } from "@/frontend/components/Utils/ThemeProvider";
import { getStudy } from "@/server/data/study";
import { getStudyInsight } from "@/server/data/studyInsights";

type ShareInsightProps = {
	id: string;
	summary: string;
	question: string;
	keyQuote?: string;
	studyId: string;
	studyImage?: string;
	documentReferenceIds?: string[];
}

export default function ShareInsightPage(props: ShareInsightProps) {
	const { sessionId } = useAuth();

	return (
		<>
			<Head>
				<title>
					{props.question}
				</title>
				<meta property="og:title" content={`${props.question}`} />
				<meta
					property="og:image"
					content={`/api/og?title=${encodeURIComponent(props.question)}`}
				/>
			</Head>

			<div
				className="flex flex-col items-center relative isolate overflow-hidden bg-white dark:bg-stone-950 min-h-screen"
			>
				<div className="absolute top-2 right-2">
					<ModeToggle />
				</div>

				<div className="flex flex-col mx-10 lg:w-1/2 mt-20 duration-1000 animate-in fade-in slide-in-from-top-5">
					{props.studyImage ? (
						<img
							src={props.studyImage}
							className={'m-auto w-48 h-48 object-contain rounded-lg dark:bg-white mb-5 duration-1000'}
							alt=""
						/>
					) : null}

					<h1 className="text-4xl font-bold mb-2 text-center lg:text-left">
						{props.question}
					</h1>

					{props.keyQuote ? (
						<h1 className="text-xl text-gray-600 dark:text-gray-400 my-5 py-5 border-t border-b border-slate-300 dark:border-slate-700">
							{props.keyQuote}
						</h1>
					) : null}

					<div>
						<Markdown
							className="leading-relaxed w-full"
							components={{
								a(props) {
									const { node, ...rest } = props
									return (
										<span className="text-blue-500 mx-1 text-xs">
											<Link2Icon className="w-3 h-3 inline-block mr-1" />
											<a className="" {...rest} />
										</span>
									)
								}
							}}
						>
							{convertIdsToLinks(
								props.summary,
								props.documentReferenceIds || [],
								props.studyId || ''
							)}
						</Markdown>
					</div>

					<div
						className={"flex flex-col lg:flex-row items-center justify-between mt-5 text-xs text-gray-500 dark:text-gray-200"}>
						<p>
							Insight derived from <strong>multiple qualitative interviews</strong>.
						</p>

						{sessionId ? (
							<Button size="sm" variant="outline" className="mt-10 lg:mt-0">
								<Link href={`/studies/${props.studyId}/insights`} className={"flex items-center"}>
									More insights
									<ArrowBigRight className="w-4 h-4 ml-2" />
								</Link>
							</Button>
						) : null}
					</div>

					<hr className={"my-10 border-slate-200 dark:border-slate-700"} />
				</div>

				<div
					className="mx-auto w-full flex items-center justify-center mb-5 text-xs dark:text-gray-400 text-gray-700 duration-1000 animate-in fade-in slide-in-from-top-5">
					<span className="mr-2">Powered by</span>
					<span>
						<MainLogo />
					</span>
				</div>
			</div>
		</>
	)
}

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



export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
	const insight = await getStudyInsight(ctx.params?.id as string);

	if (!insight || insight.shared === false) {
		return {
			props: {
				error: true
			}
		};
	}

	const studyId = insight.studyId as string;
	const study = await getStudy(studyId);

	return {
		props: {
			summary: insight.response?.explanation || '',
			question: insight.question || '',
			keyQuote: insight.keyQuote || '',
			documentReferenceIds: insight.response?.documentReferenceIds || [],
			id: insight.id,
			studyId: studyId,
			studyImage: study?.meta?.imageUrl || null
		}
	};
}
