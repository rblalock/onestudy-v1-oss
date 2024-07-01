import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "../connection";
import { study, studyInsight } from '../schema';

export const canAccessStudyInsights = async (
	studyId: string,
	organizationId: string
) => {
	const query = db
		.select({
			id: studyInsight.id,
			organizationId: studyInsight.organizationId,
			studyId: studyInsight.studyId,
		})
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
		.select({
			id: studyInsight.id,
			question: studyInsight.question,
			response: studyInsight.response,
			referencedDocuments: studyInsight.referencedDocuments,
			organizationId: studyInsight.organizationId,
			studyId: studyInsight.studyId,
			processing: studyInsight.processing,
			keyQuote: studyInsight.keyQuote,
		})
		.from(studyInsight)
		.where(
			and(
				eq(studyInsight.organizationId, organizationId),
				eq(studyInsight.studyId, studyId)
			)
		);

	return await query.execute();
};
