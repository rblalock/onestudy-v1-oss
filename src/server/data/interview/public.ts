import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/server/data/connection";
import { interview } from "@/server/data/schema";

export const getInterview = async (
	id: string
) => {
	const data = await db
		.select({
			id: interview.id,
			status: interview.status,
			summary: interview.summary,
			summaryTitle: interview.summaryTitle,
			sentiment: interview.sentiment,
			rawMessages: interview.rawMessages,
			userMetaData: interview.userMetaData,
			studyId: interview.studyId,
			organizationId: interview.organizationId,
			createdAt: interview.createdAt,
		})
		.from(interview)
		.where(eq(interview.id, id))
		.limit(1);

	return data?.length > 0 ? data[0] : undefined;
};

export const getInterviews = async (
	studyId: string,
	organizationId: string,
) => {
	const query = db
		.select({
			id: interview.id,
			status: interview.status,
			summary: interview.summary,
			summaryTitle: interview.summaryTitle,
			sentiment: interview.sentiment,
			rawMessages: interview.rawMessages,
			userMetaData: interview.userMetaData,
			studyId: interview.studyId,
			organizationId: interview.organizationId,
			createdAt: interview.createdAt,
		})
		.from(interview)
		.where(
			and(
				eq(interview.organizationId, organizationId),
				eq(interview.studyId, studyId)
			)
		)
		.limit(1000)
		.orderBy(desc(interview.createdAt));

	return await query.execute();
};
