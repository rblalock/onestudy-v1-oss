import { NonRetriableError, slugify } from 'inngest';

import { createOrganization, createOrganizationMembership, deleteOrganization, updateOrganization, updateOrganizationMembership } from '@/server/data/organization';
import { createUserWithAuthMetadata, deleteUser, updateUser } from '@/server/data/user';
import { EventClient } from "@/server/events/client";
import logger from "@/server/utils/logger";

const authWebhookHandler = EventClient.createFunction(
	{ 
		id: slugify("Handle auth webhook events"),
		name: "Handle auth webhook events" 
	},
	{ event: "hook/auth" },
	async ({ event, step }) => {
		await step.run("auth-webhook-handler", async () => {
			const body = event.data;
			const type = event.data.type;

			logger.info({ type: type }, 'Auth hook received');

			switch (type) {
				case 'user.created':
					await createUserWithAuthMetadata(body.data.id, body.data);
					break;
				case 'user.updated':
					await updateUser(body.data.id, body.data);
					break;
				case 'user.deleted':
					await deleteUser(body.data.id);
					break;
				case 'organization.created':
					await createOrganization(body.data.id, body.data);
					break;
				case 'organization.updated':
					await updateOrganization(body.data.id, body.data);
					break;
				case 'organizationMembership.created':
					await createOrganizationMembership(
						body.data.id,
						body.data.organization.id,
						body.data.public_user_data.user_id,
						body.data.role,
						body.data
					);
					break;
				case 'organizationMembership.updated':
					await updateOrganizationMembership(
						body.data.id,
						body.data.role,
						body.data
					);
					break;
				case 'organization.deleted':
					await deleteOrganization(body.data.id);
					break;
				default:
					logger.error("Missing auth event type " + type);
			}
		});
	}
);

export default authWebhookHandler;
