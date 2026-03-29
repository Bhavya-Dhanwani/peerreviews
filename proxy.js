import { NextResponse } from "next/server";

const PUBLIC_PAGE_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
]);

function hasSessionCookie(request) {
  const cookieNames = [
    "feedback_session",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
  ];

  return cookieNames.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = hasSessionCookie(request);
  const isPublicPage = PUBLIC_PAGE_PATHS.has(pathname);

  if (!isAuthenticated && !isPublicPage) {
    const loginUrl = new URL("/login", request.url);

    if (pathname !== "/") {
      loginUrl.searchParams.set("next", `${pathname}${search}`);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isPublicPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
