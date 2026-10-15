import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, computeAuthToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  const isApex = host === "lucid-cleaning.de" || host === "www.lucid-cleaning.de";
  if (isApex) {
    // Nur die Startseite auf die Marketing-Seite umschreiben. Echte Dateien
    // (Impressum, Datenschutz, Schriften, sonstige Assets) müssen direkt
    // ausgeliefert werden, sonst sind die Rechtsseiten nicht erreichbar.
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/marketing/index.html";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Public pages reached via QR code: the on-site guide (/sop) and the employee
  // time tracking (/scan, /me), which has its own PIN login per employee.
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/sop") ||
    pathname.startsWith("/scan") ||
    pathname === "/me" ||
    pathname.startsWith("/me/");

  const isApp = host.startsWith("app.");
  if (isApp && !isPublic) {
    let authenticated = false;
    try {
      const cookie = request.cookies.get(AUTH_COOKIE)?.value;
      const expected = await computeAuthToken(process.env.CRM_AUTH_SECRET || "");
      authenticated = cookie === expected;
    } catch (err) {
      console.error("Auth check failed", err);
    }
    if (!authenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
