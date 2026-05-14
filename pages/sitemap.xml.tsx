import type { GetServerSideProps } from "next";
import { SITE_URL } from "../lib/seo";

const buildSitemap = (lastmod: string): string => {
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/en`, priority: "0.9" },
  ];
  const alternates = `
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`;
  const image = `
    <image:image>
      <image:loc>${SITE_URL}/og.png</image:loc>
      <image:title>Renan Miqueloti — AI Engineer</image:title>
    </image:image>`;

  const entries = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>${alternates}${image}
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`;
};

const Sitemap = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const xml = buildSitemap(lastmod);
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=43200",
  );
  res.write(xml);
  res.end();
  return { props: {} };
};

export default Sitemap;
