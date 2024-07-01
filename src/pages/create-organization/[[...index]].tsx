import { CreateOrganization, OrganizationSwitcher, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

import { MainLogo } from "@/frontend/components/Logo";
import { afterOrgChange } from "@/frontend/components/Utils/Organization";
import { useAnalytics } from "@/frontend/lib/analytics";

export default function Page() {
	const { isLoaded, userId, sessionId, orgId } = useAuth();
	const { identify, group } = useAnalytics();

	useEffect(() => {
		if (isLoaded && userId && sessionId) {
			// Identify sends an event, so you want may want to limit how often you call it
			identify(userId, {
				sessionId: sessionId,
				organizationId: orgId,
			})
			if (orgId) {
				group('company', orgId);
			}
		}
	}, [group, identify, isLoaded, orgId, sessionId, userId]);

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<MainLogo />

			<div className="mb-5" />

			<h3>Select an organization:</h3>

			<div className="bg-slate-200 dark:bg-slate-900 p-5 rounded-xl">
				<OrganizationSwitcher
					organizationProfileMode="navigation"
					organizationProfileUrl="/settings/organization"
					afterCreateOrganizationUrl={() => {
						return afterOrgChange('/studies');
					}}
					afterSelectOrganizationUrl={() => {
						return afterOrgChange('/studies');
					}}
					afterSelectPersonalUrl={() => {
						return afterOrgChange('/studies');
					}}
					afterLeaveOrganizationUrl="/settings/organization"
					hidePersonal
					appearance={{
						elements: {
							"organizationSwitcherTrigger": 'flex m-0 p-0 items-center justify-center dark:text-white',
							'userPreviewSecondaryIdentifier': 'dark:text-gray-500 text-black'
						}
					}}
				/>
			</div>

			<div className="mb-2" />

			<h3>or</h3>

			<CreateOrganization
				afterCreateOrganizationUrl="/studies"
			/>
		</div>
	);
}