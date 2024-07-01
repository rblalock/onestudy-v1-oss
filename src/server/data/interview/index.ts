import { and, asc, desc, eq } from "drizzle-orm";

import { Interview } from "@/core/interviews/types";
import { interview } from "@/server/data/schema";

import { db } from "../connection";
import { deleteVectorDocument, getVectorDocumentByReferenceId } from "../vectorDocuments";

export const canAccessInterview = async (
	interviewId: string,
	organizationId: string
) => {
	const query = db
		.select()
		.from(interview)
		.where(
			and(
				eq(interview.id, interviewId),
				eq(interview.organizationId, organizationId),
			)
		)
		.limit(1);

	const results = await query.execute();

	return results?.length > 0;
};

export const getInterviews = async (
	studyId: string,
	organizationId: string,
) => {
	const query = db
		.select()
		.from(interview)
		.where(
			and(
				eq(interview.organizationId, organizationId),
				eq(interview.studyId, studyId)
			)
		)
		.orderBy(desc(interview.createdAt));

	return await query.execute();
};

export const getInterview = async (
	id: string
) => {
	const data = await db
		.select()
		.from(interview)
		.where(eq(interview.id, id))
		.limit(1);

	return data?.length > 0 ? data[0] : undefined;
};

export const updateInterview = async (id: string, payload: Partial<Interview>) => {
	return await db.update(interview)
		.set({
			...payload
		})
		.where(eq(interview.id, id));
};

export const createInterview = async (
	studyId: string, 
	organizationId: string, 
	payload: Partial<Interview>
) => {
	return await db.insert(interview)
		.values({
			studyId,
			organizationId,
			...payload
		})
		.returning({
			id: interview.id,
			organizationId: interview.organizationId,
		});
};

export const deleteInterview = async (id: string) => {
	const vectorDocument = await getVectorDocumentByReferenceId(id);
	if (vectorDocument && vectorDocument.id) {
		await deleteVectorDocument(vectorDocument.id);
	}

	return await db.delete(interview).where(eq(interview.id, id));
};

