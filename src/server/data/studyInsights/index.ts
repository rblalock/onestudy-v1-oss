import { and, asc, desc, eq, sql } from "drizzle-orm";

import {Study, StudyInsight} from "@/core/studies/types";
import { SearchInsightsResponse } from "@/core/vectorDocuments/types";

import { db } from "../connection";
import { study, studyInsight } from '../schema';

export const canAccessStudyInsights = async (
	studyId: string,
	organizationId: string
) => {
	const query = db
		.select()
		.from(studyInsight)
		.where(
			and(
				eq(studyInsight.studyId, studyId),
				eq(studyInsight.organizationId, organizationId),
			)
		)
		.limit(1);

	const results = await query.execute();

	return results?.length > 0;
};

export const getStudyInsights = async (
	studyId: string,
	organizationId: string,
) => {
	const query = db
		.select()
		.from(studyInsight)
		.where(
			and(
				eq(studyInsight.organizationId, organizationId),
				eq(studyInsight.studyId, studyId)
			)
		);

	return await query.execute();
};

export const getStudyInsight = async (
	id: string
) => {
	const data = await db
		.select()
		.from(studyInsight)
		.where(eq(studyInsight.id, id))
		.limit(1);

	return data?.length > 0 ? data[0] : undefined;
};

export const createStudyInsight = async (
	studyId: string,
	organizationId: string,
	question: string,
	payload: Partial<StudyInsight>
) => {
	return db.insert(studyInsight)
		.values({
			studyId,
			organizationId,
			question,
			...payload
		})
		.returning({
			id: studyInsight.id,
			organizationId: studyInsight.organizationId,
		});
};

export const deleteStudyInsight = async (id: string) => {
	return db.delete(studyInsight).where(eq(studyInsight.id, id));
};

export const updateStudyInsight = async (id: string, payload: Partial<StudyInsight>) => {
	return db.update(studyInsight)
		.set({
			...payload
		})
		.where(eq(studyInsight.id, id));
};
