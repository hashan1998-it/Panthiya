import { NextResponse, type NextRequest } from "next/server";
import { getUserRole } from "./lib/auth/getUserRole";
import { updateSession } from "./lib/supabase/middleware";

const HOME_PAGE = "/";
const PUBLIC_PAGES = ["/login", "/styleguide"];

function isSameOrSubPage(pathName: string, page: string) {
  return pathName === page || pathName.startsWith(`${page}/`);
}

function isPublicRoute(pathName: string) {
  if (pathName === HOME_PAGE) {
    return true;
  }

  return PUBLIC_PAGES.some((page) => isSameOrSubPage(pathName, page));
}

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function proxy(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const pathName = request.nextUrl.pathname;

  if (!user) {
    if (isPublicRoute(pathName)) return response;
    return redirectToLogin(request);
  }

  const role = await getUserRole(supabase, user.id);
  if (!role) {
    if (isPublicRoute(pathName)) return response;
    return redirectToLogin(request);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
