import type { NextFetchEvent, NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api(.*)",
  "/trpc(.*)",
]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // Security Headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("X-Frame-Options", "DENY");
  requestHeaders.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:;",
  );

  return clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
    if (isAdminRoute(req)) await auth.protect({ role: "admin" });
  })(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
