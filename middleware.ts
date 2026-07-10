import { NextResponse, type NextRequest } from "next/server";

const BOT_PATTERN =
  /Googlebot|bingbot|DuckDuckBot|Slackbot|Twitterbot|LinkedInBot|WhatsApp|facebookexternalhit/i;

export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_PATTERN.test(ua)) return NextResponse.next();

  if (request.cookies.get("NEXT_LOCALE")) return NextResponse.next();

  // Com i18n nativo, nextUrl chega normalizado: /en vira locale "en" +
  // pathname sem prefixo — por isso o locale é lido daqui, não do pathname.
  if (request.nextUrl.locale === "en") return NextResponse.next();

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const primary = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";

  if (primary.startsWith("en")) {
    const url = request.nextUrl.clone();
    url.locale = "en";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // locale: false — sem isso o Next expande o matcher com um segmento de
  // locale obrigatório e a regex final nunca casa com "/" nem "/en".
  matcher: [
    {
      source: "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)",
      locale: false,
    },
  ],
};
