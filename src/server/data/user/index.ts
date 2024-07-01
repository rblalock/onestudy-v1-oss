import { eq } from "drizzle-orm";
import { db } from "../connection";
import { user } from "@/server/data/schema";

export const createUserWithAuthMetadata = async (
	id: string,
	authMetadata: {[key: string]: any}
) => {
	return await db.insert(user).values({ 
		authMeta: authMetadata,
		id
	});
};

export const updateUser = async (
	id: string,
	metadata: { [key: string]: any }
) => {
	return await db.update(user)
		.set({
			authMeta: metadata
		})
		.where(eq(user.id, id));
};

export const deleteUser = async (id: string) => {
	return await db.delete(user).where(eq(user.id, id));
};
