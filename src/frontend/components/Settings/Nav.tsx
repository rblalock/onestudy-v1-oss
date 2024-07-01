import { OrganizationSwitcher } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { KeyIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Building, Monitor, MonitorDot, Tag, Webhook } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"

import { Button } from "@/frontend/components/ui/button";

import { afterOrgChange } from "../Utils/Organization";


const SettingsNav = () => {
	const pathname = usePathname()
	const { user } = useUser();

	return (
		<nav className="flex flex-col items-start lg:space-x-0">
			<div className="mb-5">
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

			<div className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 w-full text-sm">
				<Link
					href="/settings/organization"
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== "/settings/organization") ? "ghost" : "secondary"}
						size="sm"
					>
						<Building className="mr-2 h-4 w-4" /> Organization
					</Button>
				</Link>

				<Link
					href="/settings/groups"
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== "/settings/groups") ? "ghost" : "secondary"}
						size="sm"
					>
						<UserGroupIcon className="mr-2 h-4 w-4" /> Groups
					</Button>
				</Link>

				<Link
					href="/settings/tags"
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== "/settings/tags") ? "ghost" : "secondary"}
						size="sm"
					>
						<Tag className="mr-2 h-4 w-4" /> Tags
					</Button>
				</Link>

				<Link
					href="/settings/webhooks"
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== "/settings/webhooks") ? "ghost" : "secondary"}
						size="sm"
					>
						<Webhook className="mr-2 h-4 w-4" /> Webhooks
					</Button>
				</Link>

				<Link
					href="/settings/apikeys"
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== "/settings/apikeys") ? "ghost" : "secondary"}
						size="sm"
					>
						<KeyIcon className="mr-2 h-4 w-4" /> API Keys
					</Button>
				</Link>

				<Link
					href="/settings/domain"
					className=""
				>
					<Button
						className="w-full justify-start"
						variant={(pathname !== "/settings/domain") ? "ghost" : "secondary"}
						size="sm"
					>
						<MonitorDot className="mr-2 h-4 w-4" /> Domain
					</Button>
				</Link>
			</div>
		</nav>
	);
};

export default SettingsNav;
