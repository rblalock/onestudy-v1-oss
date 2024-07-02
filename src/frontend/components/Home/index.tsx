import { OrganizationSwitcher, useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/frontend/components/ui/button";
import { ModeToggle } from "@/frontend/components/Utils/ThemeProvider";
import WhiteLogo from "$/assets/icons/sm_face.svg";

import { afterOrgChange } from "../Utils/Organization";

export type HomeContentType = "default" | "outreach" | "research";

export const Header = (props: { contentType: HomeContentType }) => {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-b-gray-800 bg-black bg-opacity-95">
      <div className="container flex h-16 items-center justify-between py-4">
        <nav className="flex items-center space-x-4 lg:space-x-8 text-sm -mb-1">
          <Link className="items-center space-x-1 flex" href="/">
            <Image priority src={WhiteLogo} alt="" className="w-10 h-10" />
          </Link>
        </nav>

        <div className="flex items-center">
          {isLoaded && isSignedIn ? (
            <div className="flex items-center">
              <Button variant="link">
                <Link href="/studies" className="text-xs text-white">
                  Go to Studies
                </Link>
              </Button>

              <div className="hidden md:block">
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
                      userPreviewSecondaryIdentifier:
                        "dark:text-gray-500 text-black",
                    },
                  }}
                />
              </div>

              <div className="hidden md:block">
                <UserButton
                  signInUrl="/sign-in"
                  afterSignOutUrl="/sign-in"
                  userProfileMode="navigation"
                  userProfileUrl="/settings/profile"
                />
              </div>
            </div>
          ) : (
            <>
              <Button variant="link">
                <Link href="/studies" className="mr-5 text-white">
                  Login
                </Link>
              </Button>
            </>
          )}

          <div className="ml-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export const Footer = (props: { contentType: HomeContentType }) => {
  return (
    <>
      <footer className="">
        <div className="max-full px-6 py-12 space-x-3 md:flex md:items-center md:justify-between lg:px-8">
          <div className="">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} Shopmonkey, Inc. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
