import { NextResponse, type NextRequest } from "next/server";
import { getHomePath, type UserRole } from "./lib/auth/get-home-path";
import { getUserRole } from "./lib/auth/get-user-role";
import { updateSession } from "./lib/supabase/middleware";

const LANDING_PAGE = "/";
const LOGIN_PAGE = "/login";
const PUBLIC_PAGES = [LOGIN_PAGE, "/styleguide"];
const STUDENT_PAGES = ["/me"];

function isSameOrSubPage(pathname: string, page: string) {
  return pathname === page || pathname.startsWith(`${page}/`);
}

function matchesAnyPage(pathname: string, pages: string[]) {
  return pages.some((page) => isSameOrSubPage(pathname, page));
}

function isPublicPage(pathname: string) {
  return pathname === LANDING_PAGE || matchesAnyPage(pathname, PUBLIC_PAGES);
}

function isLoginPage(pathname: string) {
  return isSameOrSubPage(pathname, LOGIN_PAGE);
}

function getPageOwner(pathname: string): UserRole {
  return matchesAnyPage(pathname, STUDENT_PAGES) ? "student" : "admin";
}

function redirectTo(path: string, request: NextRequest, response: NextResponse) {
  const redirect = NextResponse.redirect(new URL(path, request.url));

  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));

  const cacheControl = response.headers.get("cache-control");
  if (cacheControl) {
    redirect.headers.set("cache-control", cacheControl);
  }

  return redirect;
}

export async function proxy(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const role = user ? await getUserRole(supabase, user.id) : null;

  if (!role) {
    return isPublicPage(pathname) ? response : redirectTo(LOGIN_PAGE, request, response);
  }

  if (isLoginPage(pathname)) {
    return redirectTo(getHomePath(role), request, response);
  }

  if (isPublicPage(pathname) || getPageOwner(pathname) === role) {
    return response;
  }

  return redirectTo(getHomePath(role), request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
