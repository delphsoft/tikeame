import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("tikeame_session")?.value;
  if (!token) {
    const path = request.nextUrl.pathname;
    const as = path.startsWith("/admin") ? "admin" : "organizer";
    const url = new URL("/login", request.url);
    url.searchParams.set("as", as);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/organizador", "/organizador/:path*"],
};
