import { NonRetriableError, slugify } from 'inngest';
import { ChatCompletionRequestMessageRoleEnum } from "openai-edge";

import { studyInsightsPrompt, studySummaryPrompt, studyThematicQuotesPrompt, studyThemePrompt, studyUnusualQuotesPrompt } from "@/core/studies/prompts";
import { InsightReferencedDocuments, RAGResponse, VectorDocument } from '@/core/vectorDocuments/types';
import { generateEmbeddings } from '@/server/ai/embedding';
import { ragSearch } from '@/server/ai/ragSearch';
import { summary } from "@/server/ai/summary";
import { EventName, sendAnalytics } from "@/server/analytics";
import { createInterview, getInterview, getInterviews, updateInterview } from "@/server/data/interview";
import { getStudies, getStudy, updateStudy } from "@/server/data/study";
import { vectorSearch } from '@/server/data/vectorDocuments';
import { EventClient } from "@/server/events/client";

// Handles summarizing the interview
export const studySummarizeHandler = EventClient.createFunction(
	{ name: "Summarize a study", id: slugify("Summarize a study") },
	{ event: "api/study.completed" },
	async ({ event, step, logger }) => {
		// First summarize the body
		const output = await step.run("summarize-study", async () => {
			const prompt = studySummaryPrompt();

			logger.info(
				{ studyId: event.data.studyId },
				`Getting study summary`
			);

			const interviews = await getInterviews(
				event.data.studyId,
				event.data.organizationId
			);
			const interviewText = interviews.filter(r => {
				return r.summary
			}).map(r => {
				return `title: ${r.summaryTitle || ''}\nsummary:${r.summary || ''}`;
			}).join('\n\n');

			if (!interviewText || interviews.length === 0) {
				throw new NonRetriableError('No interviews available to summarize');
			}

			const results = await summary({
				messages: [{
					role: ChatCompletionRequestMessageRoleEnum.System,
					content: `${prompt}\n\n${interviewText}`,
				}]
			}, 'gpt-4-turbo-preview');
			const payload = await results.json();

			if (payload.error) {
				logger.error(
					{ studyOd: event.data.studyId, error: payload.error },
					`Error generating study summary`
				);
				throw new Error(payload.error.message);
			}

			sendAnalytics(EventName.StudySummarized, {
				studyId: event.data.studyId,
				organizationId: event.data.organizationId,
			});

			return payload.choices[0].message?.content as string;
		});

		await step.sleep("wait-save-study-to-database", "1s");

		// Then save summaries to db
		await step.run("save-study-to-database", async () => {
			if (output) {
				logger.info(
					{
						studyId: event.data.studyId
					},
					`Saving study summary data`
				);

				await updateStudy(event.data.studyId, {
					summary: output || undefined,
				});
			}
		});

		return { output };
	}
);

export const bulkSummarizeByOrg = EventClient.createFunction(
	{ name: "Bulk summarize interviews in org", id: 'bulk-summarize-interviews-in-org' },
	{ event: "api/study.bulkSummarizeInOrganization" },
	async ({ event, step, logger }) => {
		const output = await step.run("Bulk summarize interviews in org", async () => {
			try {
				logger.info(
					{ studyId: event.data.organizationId },
					`Bulk summarizing interviews in org`
				);

				const studies = await getStudies(event.data.organizationId);
				const studyIds = studies.map((i) => i.id);

				return studyIds;
			} catch (e: any) {
				throw new NonRetriableError(e.message || 'Error generating tags');
			}
		});

		const events = output.map((id: string) => {
			return {
				name: "api/interview.bulkSummarizeInStudy",
				data: {
					organizationId: event.data.organizationId,
					studyId: id,
				},
			};
		});

		// @ts-ignore
		await step.sendEvent("fan-out-org-study-summarize", events);

		return { output };
	}
);

// Handle generate theme insights
export const studyThemeGenerator = EventClient.createFunction(
	{ name: "Generate study theme and insight", id: slugify("Generate study theme and insight") },
	{ event: "api/study.themes" },
	async ({ event, step, logger }) => {
		// First get the embeddings for the query
		const themeEmbeddings = await step.run("get-query-theme-embeddings", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Getting theme embeddings for study`
			);

			const e = await generateEmbeddings({
				input: studyThemePrompt(),
			});
			const vectors = e.data?.[0].embedding;

			return vectors;
		});
		const insightEmbeddings = await step.run("get-query-insight-embeddings", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Getting insight embeddings for study`
			);

			const e = await generateEmbeddings({
				input: studyInsightsPrompt(),
			});
			const vectors = e.data?.[0].embedding;

			return vectors;
		});

		// Then get the related documents
		const themeDocuments = await step.run("get-theme-related-documents", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Getting related documents for study themes`
			);

			const records = await vectorSearch(
				event.data.studyId,
				event.data.organizationId,
				themeEmbeddings
			);

			return records;
		});
		const insightDocuments = await step.run("get-theme-related-documents", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Getting related documents for study insights`
			);

			const records = await vectorSearch(
				event.data.studyId,
				event.data.organizationId,
				insightEmbeddings
			);

			return records;
		});

		// Then get the insight results
		const themesResults = await step.run("get-study-theme-results", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Generating study theme insights`
			);

			const themeDocs = themeDocuments as VectorDocument[];

			const prompt = `
				Interview sections:
				${themeDocs.map((r) => `${r.documentTitle} ${r.documentBody}\ndocumentReferenceId:${r.documentReferenceId}`).join('\n')}
			
				Question: """
				${studyThemePrompt()}
				"""
		
				Export the data as JSON using the following format:
				export interface RAG {
					documentReferenceIds: string[];
					explanation: string;
				}
				Where documentReferenceIds are references to the interview sections 
				that are related to the question. Do not re-use a documentReferenceId.
				Where explanation is a markdown formatted string with the answer.
		
				If you reference a documentReferenceId, do not refer to it as "document reference" 
				Only use the ID provided and refer it it as with "as found in". Do not wrap in quotes or backticks
		
				If you are unable to answer the question, please respond with "I am not able to determine this right now".
			`.trim().replace(/\t/g, '');

			const payload = await ragSearch(prompt);
			const response = JSON.parse(payload.choices[0].message?.content || '{}') as RAGResponse;
			const referencedDocuments = themeDocs
				.filter((r) => {
					if (r.documentReferenceId) {
						return response?.documentReferenceIds?.includes(r.documentReferenceId)
					}
				})
				.map((r) => {
					const tags: {
						[key: string]: {
							tag: string;
							color: string | undefined;
							count: number;
						}
					} = {};

					if (r.meta?.rawMessages) {
						r.meta.rawMessages.forEach((message: any) => {
							if (message.annotations) {
								message.annotations.forEach((annotation: any) => {
									if (annotation.tag) {
										if (!tags[annotation.tag]) {
											tags[annotation.tag] = {
												tag: annotation.tag,
												color: annotation.color,
												count: 1,
											};
										} else {
											tags[annotation.tag] = {
												tag: annotation.tag,
												color: annotation.color,
												count: tags[annotation.tag].count + 1,
											};
										}
									}
								});
							}
						});
					}

					return {
						documentReferenceId: r.documentReferenceId,
						documentType: r.documentType,
						documentTitle: r.documentTitle,
						tags: tags ? Object.values(tags) : undefined,
					}
				});

			return {
				referencedDocuments,
				ragResponse: response,
			};
		});
		const insightResults = await step.run("get-study-insight-results", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Generating study insights`
			);

			const insightDocs = insightDocuments as VectorDocument[];

			const prompt = `
				Interview sections:
				${insightDocs.map((r) => `${r.documentTitle} ${r.documentBody}\ndocumentReferenceId:${r.documentReferenceId}`).join('\n')}
			
				Question: """
				${studyInsightsPrompt()}
				"""
		
				Export the data as JSON using the following format:
				export interface RAG {
					documentReferenceIds: string[];
					explanation: string;
				}
				Where documentReferenceIds are references to the interview sections 
				that are related to the question. Do not re-use a documentReferenceId.
				Where explanation is a markdown formatted string with the answer.
		
				If you reference a documentReferenceId, do not refer to it as "document reference" 
				Only use the ID provided and refer it it as with "as found in". Do not wrap in quotes or backticks
		
				If you are unable to answer the question, please respond with "I am not able to determine this right now".
			`.trim().replace(/\t/g, '');

			const payload = await ragSearch(prompt);
			const response = JSON.parse(payload.choices[0].message?.content || '{}') as RAGResponse;
			const referencedDocuments = insightDocs
				.filter((r) => {
					if (r.documentReferenceId) {
						return response?.documentReferenceIds?.includes(r.documentReferenceId)
					}
				})
				.map((r) => {
					const tags: {
						[key: string]: {
							tag: string;
							color: string | undefined;
							count: number;
						}
					} = {};

					if (r.meta?.rawMessages) {
						r.meta.rawMessages.forEach((message: any) => {
							if (message.annotations) {
								message.annotations.forEach((annotation: any) => {
									if (annotation.tag) {
										if (!tags[annotation.tag]) {
											tags[annotation.tag] = {
												tag: annotation.tag,
												color: annotation.color,
												count: 1,
											};
										} else {
											tags[annotation.tag] = {
												tag: annotation.tag,
												color: annotation.color,
												count: tags[annotation.tag].count + 1,
											};
										}
									}
								});
							}
						});
					}

					return {
						documentReferenceId: r.documentReferenceId,
						documentType: r.documentType,
						documentTitle: r.documentTitle,
						tags: tags ? Object.values(tags) : undefined,
					}
				});

			return {
				referencedDocuments,
				ragResponse: response,
			};
		});

		const savedThemesAndInsights = await step.run("save-study-insights", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Saving study themes and insights`
			);

			const study = await getStudy(event.data.studyId);

			await updateStudy(event.data.studyId, {
				meta: {
					...study?.meta,
					themes: {
						response: themesResults.ragResponse,
						referencedDocuments: themesResults.referencedDocuments as InsightReferencedDocuments[],
						processing: false,
					},
					insights: {
						response: insightResults.ragResponse,
						referencedDocuments: insightResults.referencedDocuments as InsightReferencedDocuments[],
						processing: false,
					}
				}
			});

			sendAnalytics(EventName.CreateStudySummaryInsight, {
				organizationId: event.data.organizationId,
				studyId: event.data.studyId,
			});

			return {
				themes: themesResults,
				insights: insightResults,
			};
		});

		return { ...savedThemesAndInsights };
	}
);

export const studyQuoteGenerator = EventClient.createFunction(
	{ name: "Generate study quotes", id: slugify("Generate study quotes") },
	{ event: "api/study.quotes" },
	async ({ event, step, logger }) => {
		// First get the embeddings for the query
		const thematicQuotesEmbeddings = await step.run("get-query-quote-embeddings", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Getting quote embeddings for study`
			);

			const e = await generateEmbeddings({
				input: studyThematicQuotesPrompt(),
			});
			const vectors = e.data?.[0].embedding;

			return vectors;
		});
		const notableQuotesEmbeddings = await step.run("get-query-notable-quotes-embeddings", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Getting notable quotes embeddings for study`
			);

			const e = await generateEmbeddings({
				input: studyUnusualQuotesPrompt(),
			});
			const vectors = e.data?.[0].embedding;

			return vectors;
		});

		// Then get the related documents
		const thematicQuotesDocuments = await step.run("get-thematic-quotes-related-documents", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Getting related documents for study themes`
			);

			const records = await vectorSearch(
				event.data.studyId,
				event.data.organizationId,
				thematicQuotesEmbeddings
			);

			return records;
		});
		const notableQuotesDocuments = await step.run("get-notable-quotes-related-documents", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Getting related documents for study insights`
			);

			const records = await vectorSearch(
				event.data.studyId,
				event.data.organizationId,
				notableQuotesEmbeddings
			);

			return records;
		});

		// Then get the insight results
		const thematicQuotesResults = await step.run("get-study-thematic-quotes-results", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Generating study thematic quotes`
			);

			const thematicQuotesDocs = thematicQuotesDocuments as VectorDocument[];

			const prompt = `
				Interview sections:
				${thematicQuotesDocs.map((r) => `${r.documentTitle} ${r.documentBody}\ndocumentReferenceId:${r.documentReferenceId}`).join('\n')}
			
				Question: """
				${studyThematicQuotesPrompt()}
				"""
		
				Export the data as JSON using the following format:
				export interface RAG {
					documentReferenceIds: string[];
					explanation: string;
				}
				Where documentReferenceIds are references to the interview sections 
				that are related to the question. Do not re-use a documentReferenceId.
				Where explanation is a markdown formatted string with the answer.
		
				If you reference a documentReferenceId, do not refer to it as "document reference" 
				Only use the ID provided and refer it it as with "as found in". Do not wrap in quotes or backticks
		
				If you are unable to answer the question, please respond with "I am not able to determine this right now".
			`.trim().replace(/\t/g, '');

			const payload = await ragSearch(prompt);
			const response = JSON.parse(payload.choices[0].message?.content || '{}') as RAGResponse;
			const referencedDocuments = thematicQuotesDocs
				.filter((r) => {
					if (r.documentReferenceId) {
						return response?.documentReferenceIds?.includes(r.documentReferenceId)
					}
				})
				.map((r) => {
					const tags: {
						[key: string]: {
							tag: string;
							color: string | undefined;
							count: number;
						}
					} = {};

					if (r.meta?.rawMessages) {
						r.meta.rawMessages.forEach((message: any) => {
							if (message.annotations) {
								message.annotations.forEach((annotation: any) => {
									if (annotation.tag) {
										if (!tags[annotation.tag]) {
											tags[annotation.tag] = {
												tag: annotation.tag,
												color: annotation.color,
												count: 1,
											};
										} else {
											tags[annotation.tag] = {
												tag: annotation.tag,
												color: annotation.color,
												count: tags[annotation.tag].count + 1,
											};
										}
									}
								});
							}
						});
					}

					return {
						documentReferenceId: r.documentReferenceId,
						documentType: r.documentType,
						documentTitle: r.documentTitle,
						tags: tags ? Object.values(tags) : undefined,
					}
				});

			return {
				referencedDocuments,
				ragResponse: response,
			};
		});
		const notableQuotesResults = await step.run("get-study-notable-quotes-results", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Generating study insights`
			);

			const notableQuotesDocs = notableQuotesDocuments as VectorDocument[];

			const prompt = `
				Interview sections:
				${notableQuotesDocs.map((r) => `${r.documentTitle} ${r.documentBody}\ndocumentReferenceId:${r.documentReferenceId}`).join('\n')}
			
				Question: """
				${studyUnusualQuotesPrompt()}
				"""
		
				Export the data as JSON using the following format:
				export interface RAG {
					documentReferenceIds: string[];
					explanation: string;
				}
				Where documentReferenceIds are references to the interview sections 
				that are related to the question. Do not re-use a documentReferenceId.
				Where explanation is a markdown formatted string with the answer.
		
				If you reference a documentReferenceId, do not refer to it as "document reference" 
				Only use the ID provided and refer it it as with "as found in". Do not wrap in quotes or backticks
		
				If you are unable to answer the question, please respond with "I am not able to determine this right now".
			`.trim().replace(/\t/g, '');

			const payload = await ragSearch(prompt);
			const response = JSON.parse(payload.choices[0].message?.content || '{}') as RAGResponse;
			const referencedDocuments = notableQuotesDocs
				.filter((r) => {
					if (r.documentReferenceId) {
						return response?.documentReferenceIds?.includes(r.documentReferenceId)
					}
				})
				.map((r) => {
					const tags: {
						[key: string]: {
							tag: string;
							color: string | undefined;
							count: number;
						}
					} = {};

					if (r.meta?.rawMessages) {
						r.meta.rawMessages.forEach((message: any) => {
							if (message.annotations) {
								message.annotations.forEach((annotation: any) => {
									if (annotation.tag) {
										if (!tags[annotation.tag]) {
											tags[annotation.tag] = {
												tag: annotation.tag,
												color: annotation.color,
												count: 1,
											};
										} else {
											tags[annotation.tag] = {
												tag: annotation.tag,
												color: annotation.color,
												count: tags[annotation.tag].count + 1,
											};
										}
									}
								});
							}
						});
					}

					return {
						documentReferenceId: r.documentReferenceId,
						documentType: r.documentType,
						documentTitle: r.documentTitle,
						tags: tags ? Object.values(tags) : undefined,
					}
				});

			return {
				referencedDocuments,
				ragResponse: response,
			};
		});

		const savedQuotes = await step.run("save-study-insights", async () => {
			logger.info(
				{ studyId: event.data.studyId },
				`Saving study quotes`
			);

			const study = await getStudy(event.data.studyId);

			await updateStudy(event.data.studyId, {
				meta: {
					...study?.meta,
					thematicQuotes: {
						response: thematicQuotesResults.ragResponse,
						referencedDocuments: thematicQuotesResults.referencedDocuments as InsightReferencedDocuments[],
						processing: false,
					},
					notableQuotes: {
						response: notableQuotesResults.ragResponse,
						referencedDocuments: notableQuotesResults.referencedDocuments as InsightReferencedDocuments[],
						processing: false,
					}
				}
			});

			sendAnalytics(EventName.CreateStudySummaryInsight, {
				organizationId: event.data.organizationId,
				studyId: event.data.studyId,
			});

			return {
				thematicQuotes: thematicQuotesResults,
				notableQuotes: notableQuotesResults,
			};
		});

		return { ...savedQuotes };
	}
);
