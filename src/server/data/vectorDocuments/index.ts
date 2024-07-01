import { and, asc, desc, eq, sql } from "drizzle-orm";
import { l2Distance, cosineDistance, maxInnerProduct } from 'pgvector/drizzle-orm';

import { db } from "../connection";
import { vectorDocument } from "../schema";
import { VectorDocument } from "@/core/vectorDocuments/types";
import { generateEmbeddings } from "@/server/ai/embedding";

export const canAccessVectorDocuments = async (
	studyId: string,
	organizationId: string
) => {
	const query = db
		.select()
		.from(vectorDocument)
		.where(
			and(
				eq(vectorDocument.studyId, studyId),
				eq(vectorDocument.organizationId, organizationId),
			)
		)
		.limit(1);

	const results = await query.execute();

	return results?.length > 0;
};

export const getVectorDocuments = async (
	studyId: string,
	organizationId: string,
) => {
	const query = db
		.select()
		.from(vectorDocument)
		.where(
			and(
				eq(vectorDocument.organizationId, organizationId),
				eq(vectorDocument.studyId, studyId)
			)
		);

	return await query.execute();
};

export const getVectorDocument = async (
	id: string
) => {
	const data = await db
		.select()
		.from(vectorDocument)
		.where(eq(vectorDocument.id, id))
		.limit(1);

	return data?.length > 0 ? data[0] : undefined;
};

export const getVectorDocumentByReferenceId = async (
	id: string
) => {
	const data = await db
		.select()
		.from(vectorDocument)
		.where(eq(vectorDocument.documentReferenceId, id))
		.limit(1);

	return data?.length > 0 ? data[0] : undefined;
};

export const updateVectorDocument = async (
	id: string, 
	payload: Partial<VectorDocument>
) => {
	return await db.update(vectorDocument)
		.set({
			...payload
		})
		.where(eq(vectorDocument.id, id));
};

export const createVectorDocument = async (
	studyId: string,
	organizationId: string,
	payload: Partial<VectorDocument>
) => {
	return await db.insert(vectorDocument)
		.values({
			studyId,
			organizationId,
			...payload
		})
		.returning({
			id: vectorDocument.id,
			organizationId: vectorDocument.organizationId,
		});
};

export const deleteVectorDocument = async (id: string) => {
	return await db.delete(vectorDocument).where(eq(vectorDocument.id, id));
};

export const vectorSearch = async (
	studyId: string,
	organizationId: string,
	vectors: number[]
) => {
	const data = await db
		.select()
		.from(vectorDocument)
		.where(
			and(
				eq(vectorDocument.studyId, studyId),
				eq(vectorDocument.organizationId, organizationId),
			)
		)
		// .where(sql`(${vectorDocument.embedding} <-> ${JSON.stringify(vectors)}) < 0.7`)
		.orderBy(cosineDistance(vectorDocument.embedding, vectors))
		.limit(20);

	return data as VectorDocument[];
}

export const createEmbeddingWithDocument = async (
	studyId: string,
	organizationId: string,
	documentType: string,
	documentReferenceId: string,
	documentBody: string,
	documentTitle: string,
	meta?: {[key: string]: any}
) => {
	const embeddings = await generateEmbeddings({
		input: `${documentTitle}\n${documentBody}`
	});
	const payload = embeddings.data.map((embedding) => embedding.embedding);

	return await db.insert(vectorDocument)
		.values({
			studyId,
			organizationId,
			documentReferenceId,
			documentType,
			documentTitle,
			documentBody,
			embedding: payload[0],
			meta: {
				...(meta || {})
			}
		})
		.onConflictDoUpdate({
			target: vectorDocument.documentReferenceId,
			set: {
				documentTitle,
				documentBody,
				embedding: payload[0],
				meta: {
					...(meta || {})
				}
			},
			where: sql`${vectorDocument.documentReferenceId} = ${documentReferenceId}`,
		})
		.returning({
			id: vectorDocument.id,
			documentReferenceId: vectorDocument.documentReferenceId,
			studyId: vectorDocument.studyId,
			organizationId: vectorDocument.organizationId,
		});
}
