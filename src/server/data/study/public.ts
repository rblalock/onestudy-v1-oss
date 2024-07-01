import {eq} from "drizzle-orm";

import {db} from "@/server/data/connection";
import {study} from "@/server/data/schema";

export const getStudy = async (
	id: string
) => {
	const data = await db
		.select({
			id: study.id,
			name: study.name,
			userMetaData: study.userMetaData,
			metaData: study.meta,
			status: study.status,
			organizationId: study.organizationId,
		})
		.from(study)
		.where(eq(study.id, id))
		.limit(1);

	return data?.length > 0 ? data[0] : undefined;
};
