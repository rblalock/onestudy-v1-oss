import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { ModeToggle } from "@/frontend/components/Utils/ThemeProvider";
import { cn } from "@/frontend/lib/utils";

import { MainLogo } from "../Logo";
import { afterOrgChange } from "../Utils/Organization";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header className="sticky top-0 z-40 border-b border-b-gray-200 dark:border-b-gray-800 bg-white dark:bg-black">
      <div className="container flex h-16 items-center justify-between py-4">
        <nav
          className={cn(
            "flex items-center space-x-4 lg:space-x-8 text-sm",
            className
          )}
          {...props}
        >
          <div className="hidden md:flex">
            <MainLogo />
          </div>

          {/* <Link
						href="/dashboard"
						className="font-medium text-black dark:text-white"
					>
						Dashboard
					</Link> */}
          <Link
            href="/studies"
            className="font-medium text-black dark:text-white"
          >
            Studies
          </Link>
          <Link
            href="/settings"
            className="font-medium text-black dark:text-white"
          >
            Settings
          </Link>
        </nav>

        <div className="flex items-center">
          <OrganizationSwitcher
            organizationProfileMode="navigation"
            organizationProfileUrl="/settings/organization"
            afterCreateOrganizationUrl={() => {
              return afterOrgChange("/studies");
            }}
            afterSelectOrganizationUrl={() => {
              return afterOrgChange("/studies");
            }}
            afterSelectPersonalUrl={() => {
              return afterOrgChange("/studies");
            }}
            afterLeaveOrganizationUrl="/settings/organization"
            hidePersonal
            appearance={{
              elements: {
                organizationSwitcherTrigger:
                  "flex mx-5 p-0 items-center justify-center dark:text-white",
                userPreviewSecondaryIdentifier: "dark:text-gray-500 text-black",
              },
            }}
          />

          <UserButton
            signInUrl="/sign-in"
            afterSignOutUrl="/sign-in"
            userProfileMode="navigation"
            userProfileUrl="/settings/profile"
          />

          <div className="ml-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
