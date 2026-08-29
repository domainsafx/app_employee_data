import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ep_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  let session: any = null;
  try {
    session = raw ? JSON.parse(raw) : null;
  } catch {
    session = null;
  }

  const isAdminArea = pathname.startsWith("/admin");
  const isSuperAdminArea = pathname.startsWith("/superadmin");
  const isEmployeeArea = pathname.startsWith("/employee");

  if (isAdminArea && (!session || session.type !== "admin")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isSuperAdminArea && (!session || session.type !== "admin" || session.role !== "superadmin")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isEmployeeArea && (!session || session.type !== "employee")) {
    return NextResponse.redirect(new URL("/employee-login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*", "/employee/:path*"],
};
