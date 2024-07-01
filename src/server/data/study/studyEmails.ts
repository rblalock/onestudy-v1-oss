import { eq, sql } from "drizzle-orm";
import { db } from "../connection";
import { studyEmails } from "@/server/data/schema";

export const getStudyEmailByStudyId = async (
	id: string
) => {
	const data = await db
		.select()
		.from(studyEmails)
		.where(eq(studyEmails.studyId, id))
		.limit(1);

	return data?.length > 0 ? data[0] : undefined;
};

export const updateStudyEmails = async (
	studyId: string, 
	organizationId: string,
	emails: string[]
) => {
	await db.insert(studyEmails)
		.values({ 
			studyId,
			organizationId,
			meta: {
				emails
			}
		})
		.onConflictDoUpdate({ 
			target: studyEmails.studyId, 
			set: {
				meta: {
					emails
				}
			},
			where: sql`${studyEmails.studyId} = ${studyId}`,
		});
};

