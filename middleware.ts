import { NextResponse, type NextRequest } from "next/server";

const BOT_PATTERN =
  /Googlebot|bingbot|DuckDuckBot|Slackbot|Twitterbot|LinkedInBot|WhatsApp|facebookexternalhit/i;

export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_PATTERN.test(ua)) return NextResponse.next();

  if (request.cookies.get("NEXT_LOCALE")) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return NextResponse.next();
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const primary = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";

  if (primary.startsWith("en")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)"],
};
