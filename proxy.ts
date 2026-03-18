import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode("pakadmin_secret_key_2026");

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      await jwtVerify(token, SECRET);
      if (isLoginPage) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      if (!isLoginPage) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};