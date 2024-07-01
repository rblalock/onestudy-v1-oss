import { eq } from "drizzle-orm";

import { organization, organizationMember } from "@/server/data/schema";

import { db } from "../connection";

export const createOrganization = async (
	id: string,
	metadata: { [key: string]: any }
) => {
	return await db.insert(organization).values({
		meta: metadata,
		id
	});
};

export const updateOrganization = async (
	id: string,
	metadata: { [key: string]: any }
) => {
	return await db.update(organization)
		.set({
			meta: metadata
		})
		.where(eq(organization.id, id));
};

export const deleteOrganization = async (id: string) => {
	return await db.delete(organization).where(eq(organization.id, id));
};

export const createOrganizationMembership = async (
	id: string,
	organizationId: string,
	userId: string,
	role: string,
	metadata: { [key: string]: any }
) => {
	return await db.insert(organizationMember).values({
		id,
		organizationId,
		userId,
		role,
		meta: metadata
	});
};

export const updateOrganizationMembership = async (
	id: string,
	role: string,
	metadata: { [key: string]: any }
) => {
	return await db.update(organizationMember)
		.set({
			role,
			meta: metadata
		})
		.where(eq(organizationMember.id, id));
};

export const getOrganizationDomain = async (
	id: string
) => {
	const query = db
		.select({
			domain: organization.domain
		})
		.from(organization)
		.where(eq(organization.id, id))
		.limit(1);

	const results = await query.execute();

	return results[0].domain;
};

export const updateOrganizationDomain = async (
	id: string,
	domain?: string
) => {
	return await db.update(organization)
		.set({
			domain: domain || null
		})
		.where(eq(organization.id, id));
};

export const updateOrganizationWebhook = async (
	id: string,
	webhookAppId: string
) => {
	return await db.update(organization)
		.set({
			webhookAppId: webhookAppId
		})
		.where(eq(organization.id, id));
};
