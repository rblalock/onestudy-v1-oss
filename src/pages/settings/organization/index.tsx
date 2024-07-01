import { OrganizationProfile, useOrganization, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation"
import { useRouter } from 'next/router'
import { useEffect } from "react";

import LayoutMain from "@/frontend/components/Layout/Main";
import SettingsNav from "@/frontend/components/Settings/Nav";

const SettingsOrganization = () => {
	const pathname = usePathname();
	const { isLoaded, organization } = useOrganization();
	const { user } = useUser();
	const router = useRouter()

	useEffect(() => {
		// Redirect to create organization page if user is logged in and doesn't have an organization
		if (isLoaded && !organization && user) {
			router.push('/create-organization');
		}
	}, [isLoaded, organization, router, user]);

	return (
		<LayoutMain>
			<div className="space-y-6 pb-16 md:block">
				<div className="space-y-0.5">
					<h2 className="text-2xl font-bold tracking-tight">Settings</h2>
					<p className="text-muted-foreground">
						Manage your account, organization, and preferences.
					</p>
				</div>

				<hr className="my-6 dark:border-gray-800" />

				<div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
					<aside className="">
						<SettingsNav />
					</aside>
					<div className="flex-1">
						<OrganizationProfile
							appearance={{
								elements: {
									card: {
										// boxShadow: "none",
										// borderRadius: "0",
										// borderLeft: "1px solid #eee"
									}
								}
							}}
						/>
					</div>
				</div>
			</div>
		</LayoutMain>
	);
};

export default SettingsOrganization;
