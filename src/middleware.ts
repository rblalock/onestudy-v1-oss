import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/link/(.*)",
    "/landing",
    "/link/:id",
    "/monitoring",
    "/sign-in/(.*)",
    "/sign-up/(.*)",
    "/interview/(.*)",
    "/share/(.*)",
    "/create-organization/(.*)",
    "/(api|trpc)(.*)",
    "/(assets)(.*)",
    "/api/inngest",
  ],
  afterAuth(auth, req) {
    // handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    // redirect them to organization selection page
    if (
      auth.userId &&
      !auth.orgId &&
      req.nextUrl.pathname !== "/settings/organization" &&
      req.nextUrl.pathname !== "/create-organization"
    ) {
      const orgSelection = new URL("/settings/organization", req.url);
      return NextResponse.redirect(orgSelection);
    }
  },
});

export const config = {
  // matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)", "/"],
};

// export const config = {
// 	matcher: [
// 		"/((?!.*\\..*|_next).*)",
// 		"/",
// 		// "/(api|trpc)(.*)",
// 		// "/api/inngest",
// 	],
// };
