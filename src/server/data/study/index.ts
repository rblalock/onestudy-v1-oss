import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../connection";
import { interview, study } from "@/server/data/schema";
import { Study, StudyStatus } from "@/core/studies/types";

export const canAccessStudy = async (
	id: string,
	organizationId: string
) => {
	const query = db
		.select()
		.from(study)
		.where(
			and(
				eq(study.id, id),
				eq(study.organizationId, organizationId),
			)
		)
		.limit(1);

	const results = await query.execute();

	return results?.length > 0;
};

export const createStudy = async (
	name: string,
	userId: string,
	organizationId: string,
	organizationGroupId?: string,
) => {
	const results = await db.insert(study).values({
		name,
		organizationId: organizationId,
		userId: userId,
		orgGroup: organizationGroupId,
		status: StudyStatus.INACTIVE
	}).returning({
		id: study.id
	});

	return results?.[0]?.id;
};

export const getStudies = async (
	organizationId: string,
	organizationGroupId?: string,
) => {
	const query = db
		.select()
		.from(study);

	if (organizationGroupId) {
		query.where(
			and(
				eq(study.organizationId, organizationId),
				eq(study.orgGroup, organizationGroupId)
			)
		);
	} else {
		query.where(eq(study.organizationId, organizationId));
	}

	query.orderBy(desc(study.createdAt));

	return await query.execute();
};

export const getStudy = async (
	id: string
) => {
	const data = await db
		.select()
		.from(study)
		.where(eq(study.id, id))
		.limit(1);
	
	return data?.length > 0 ? data[0] : undefined;
};

export const updateStudy = async (id: string, payload: Partial<Study>) => {
	return db.update(study)
		.set({
			...payload
		})
		.where(eq(study.id, id));
};

export const deleteStudy = async (id: string) => {
	return await db.delete(study).where(eq(study.id, id));
};

// Study list queries

export const getStudiesWithInterviewCount = async (
	organizationId: string,
	organizationGroupId?: string,
) => {
	if (organizationGroupId) {
		return getStudiesWithInterviewCountByGroup(organizationId, organizationGroupId);
	}

	const query = sql`
		SELECT 
			s."id", 
			s."name", 
			s."status", 
			s."meta", 
			s."summary", 
			s."organization_id", 
			s."org_group_id", 
			s."user_id", 
			s."created_at" AS "createdAt", 
			COUNT(i.id) AS "interviewCount"
		FROM 
			"study" s
		LEFT JOIN 
			"interview" i ON s."id" = i."study_id"
		WHERE s."organization_id" = ${organizationId}
		GROUP BY 
			s."id"
		ORDER BY 
			s."created_at" DESC;
	`;
	const results = await db.execute(query);

	return results as unknown as (Partial<Study> & { interviewCount: number })[];
};

export const getStudiesWithInterviewCountByGroup = async (
	organizationId: string,
	organizationGroupId: string,
) => {
	const query = sql`
		SELECT 
			s."id", 
			s."name", 
			s."status", 
			s."meta", 
			s."summary", 
			s."organization_id", 
			s."org_group_id", 
			s."user_id", 
			s."created_at" AS "createdAt", 
			COUNT(i.id) AS "interviewCount"
		FROM 
			"study" s
		LEFT JOIN 
			"interview" i ON s."id" = i."study_id"
		WHERE s."organization_id" = ${organizationId} AND s."org_group_id" = ${organizationGroupId}
		GROUP BY 
			s."id"
		ORDER BY 
			s."created_at" DESC;
	`;
	const results = await db.execute(query);

	return results as unknown as (Partial<Study> & { interviewCount: number })[];
};
