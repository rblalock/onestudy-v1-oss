import LayoutMain from "@/frontend/components/Layout/Main";
import SettingsNav from "@/frontend/components/Settings/Nav";

const SettingsPage = () => {
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
						<p>
							Select an option to manage your account.
						</p>
					</div>
				</div>
			</div>
		</LayoutMain>
	);
};

export default SettingsPage;

// export function getServerSideProps() {
// 	// we do not have a main settings page and nested layout are not a thing yet,
// 	// so, we redirect to the Profile Page
// 	return {
// 		redirect: {
// 			destination: `/settings/profile`,
// 		},
// 	};
// }
