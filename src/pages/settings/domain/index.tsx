import LayoutMain from "@/frontend/components/Layout/Main";
import DomainPage from "@/frontend/components/Settings/Domain";
import SettingsNav from "@/frontend/components/Settings/Nav";

const SettingsDomain = () => {
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
						<DomainPage />
					</div>
				</div>
			</div>
		</LayoutMain>
	);
};

export default SettingsDomain;
