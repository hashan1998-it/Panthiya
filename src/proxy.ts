import { NextResponse, type NextRequest } from "next/server";
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
  const { response, user } = await updateSession(request);

  if (user) return response;
  if (isPublicRoute(request.nextUrl.pathname)) return response;

  return redirectToLogin(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
