import { and, desc, eq } from "drizzle-orm";
import { ChatCompletionRequestMessageRoleEnum } from "openai-edge";

import { interviewTagPrompt } from "@/core/interviews/prompts";
import { Tag } from "@/core/tags/types";
import { Annotation } from "@/core/types";
import { generateRandomColor } from "@/core/utils/color";
import { sanitizeTags, tag as tagWithAi } from "@/server/ai/tag";
import { tag } from "@/server/data/schema";
import logger from "@/server/utils/logger";

import { db } from "../connection";
import { getInterview, updateInterview } from "../interview";
import { getStudy } from "../study";

export const canAccessTag = async (
	tagId: string,
	organizationId: string
) => {
	const query = db
		.select()
		.from(tag)
		.where(
			and(
				eq(tag.id, tagId),
				eq(tag.organizationId, organizationId),
			)
		)
		.limit(1);

	const results = await query.execute();

	return results?.length > 0;
};

export const getTagsByStudyId = async (
	studyId: string,
	orgId: string
) => {
	const query = db
		.select()
		.from(tag)
		.where(
			and(
				eq(tag.studyId, studyId),
				eq(tag.organizationId, orgId)
			)
		)
		.orderBy(desc(tag.createdAt));

	return await query.execute();
};

export const getTagsByOrgId = async (
	orgId: string
) => {
	const query = db
		.select()
		.from(tag)
		.where(
			and(
				eq(tag.organizationId, orgId)
			)
		)
		.orderBy(desc(tag.createdAt));

	return await query.execute();
};

export const getTag = async (
	id: string
) => {
	const data = await db
		.select()
		.from(tag)
		.where(eq(tag.id, id))
		.limit(1);

	return data?.length > 0 ? data[0] : undefined;
};

export const updateTag = async (id: string, payload: Partial<Tag>) => {
	return await db.update(tag)
		.set({
			...payload
		})
		.where(eq(tag.id, id));
};

export const createTag = async (
	organizationId: string,
	payload: Partial<Tag>,
	studyId?: string,
) => {
	return await db.insert(tag)
		.values({
			studyId: studyId || undefined,
			organizationId,
			...payload
		})
		.returning({
			id: tag.id
		});
};

export const deleteTag = async (id: string) => {
	return await db.delete(tag).where(eq(tag.id, id));
};

export const addTagsIfNotExists = async (
	organizationId: string,
	studyId: string,
	tags: string[],
	existingTags: string[],
) => {
	const newTags: string[] = [];

	tags.forEach(t => {
		if (!existingTags.includes(t) && !newTags.some(tag => tag === t)) {
			newTags.push(t);
		}
	});

	logger.info(
		`${newTags.length} New tags created`,
		{ tags: newTags }
	);

	return await Promise.all(newTags.map(async (t) => {
		return await createTag(
			organizationId, {
				tagName: t,
				color: generateRandomColor(),
			}, 
			studyId
		);
	}));
};

export const generateTags = async (
	organizationId: string,
	studyId: string,
	interviewId: string,
) => {
	const tags = await getTagsByOrgId(organizationId);
	const interview = await getInterview(interviewId);
	const study = await getStudy(studyId);

	const tagNames = tags?.map(t => t.tagName).filter((t): t is string => Boolean(t));
	const studyInfo = study?.meta?.generalInformation;
	const prompt = interviewTagPrompt(tagNames, studyInfo);

	const text = interview?.rawMessages?.map((m: any) => {
		return `${m.role}\n${m.content}\n`;
	}).join('\n');

	const results = await tagWithAi({
		text: text || '',
		prompt,
	});

	const choices = results.choices;
	if (choices[0] && choices[0].message.content) {
		if (choices[0].finish_reason === 'length') {
			throw new Error('Tagging unable to be completed, too long or an error');
		}

		const json = JSON.parse(choices[0].message.content);
		if (json?.annotations) {
			// Santize tags in case they're messed up
			const tags = sanitizeTags(json.annotations);
			const allTags = await getTagsByOrgId(organizationId);
			const existingTagNames = allTags
				.filter(t => t.tagName !== null)
				.map(t => t.tagName as string);

			// Add any new tags not in the db
			await addTagsIfNotExists(
				organizationId,
				studyId,
				tags.map(t => t.tag),
				existingTagNames
			);
			const interview = await getInterview(interviewId);
			const messages = interview?.rawMessages?.map((m: any) => {
				if (m.role === ChatCompletionRequestMessageRoleEnum.System || m.role === ChatCompletionRequestMessageRoleEnum.Assistant) {
					return m;
				}

				// Iterate over all tags to find any that match within the message content
				const annotations = tags.reduce((acc: Annotation[], t) => {
					const start = m.content.indexOf(t.text);
					if (start !== -1) {
						const dbTag = allTags.find(tag => tag.tagName === t.tag);
						const end = start + t.text.length;
						acc.push({
							start,
							end,
							text: t.text,
							tag: t.tag,
							color: dbTag?.color || generateRandomColor(),
						});
					}
					return acc;
				}, []);

				// If any annotations were found, add them to the message
				if (annotations.length > 0) {
					return {
						...m,
						annotations,
					};
				}
				return m;
			});

			if (messages && messages.length > 0) {
				await updateInterview(interviewId, {
					rawMessages: messages,
				});
			}
		}
	}

	return choices;
};
