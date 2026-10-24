import { NextResponse, type NextRequest } from "next/server";

// Quick check only: pages and server actions under /admin verify the session properly with requireMember().
export function proxy(request: NextRequest) {
  if (!request.cookies.has("cp_session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };
