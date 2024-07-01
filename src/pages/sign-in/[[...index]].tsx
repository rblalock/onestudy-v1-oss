import { SignIn, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

import { MainLogo } from "@/frontend/components/Logo";
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

			<SignIn 
				path="/sign-in" 
				routing="path" 
				signUpUrl="/sign-up"
				afterSignInUrl="/studies"
				afterSignUpUrl="/create-organization"
			/>
		</div>
	);
}