import { and, eq } from "drizzle-orm";

import { organizationGroup } from "@/server/data/schema";

import { db } from "../connection";

export const canAccessGroup = async (
	id: string,
	organizationId: string
) => {
	const query = db
		.select()
		.from(organizationGroup)
		.where(
			and(
				eq(organizationGroup.id, id),
				eq(organizationGroup.organizationId, organizationId),
			)
		)
		.limit(1);

	const results = await query.execute();

	return results?.length > 0;
};

export const getGroups = async (
	organizationId: string
) => {
	return await db
		.select()
		.from(organizationGroup)
		.where(eq(organizationGroup.organizationId, organizationId));
};

export const createOrganizationGroup = async (
	name: string,
	organizationId: string,
) => {
	return await db.insert(organizationGroup).values({
		name: name,
		organizationId: organizationId,
	});
};

export const deleteOrganizationGroup = async (id: string) => {
	return await db.delete(organizationGroup).where(eq(organizationGroup.id, id));
};
