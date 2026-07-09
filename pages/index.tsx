import type { NextPage } from "next";
import Head from "next/head";
import { NextSeo } from "next-seo";
import {
  Header,
  About,
  Skills,
  Projects,
  Contact,
} from "../components";
import {
  getOgImage,
  getPersonJsonLd,
  getProfilePageJsonLd,
  getWebsiteJsonLd,
  SITE_URL,
} from "../lib/seo";
import { useLocale } from "../lib/useLocale";
import { useSectionViews } from "../lib/useSectionViews";

const SECTION_IDS = ["about", "skills", "projects", "contact"];

const Home: NextPage = () => {
  const { t, locale } = useLocale();
  useSectionViews(SECTION_IDS);
  const m = t.meta;
  const canonical = locale === "en" ? `${SITE_URL}/en` : `${SITE_URL}/`;
  const ogImage = getOgImage(locale);

  return (
    <>
      <NextSeo
        title={m.title}
        description={m.description}
        canonical={canonical}
        openGraph={{
          type: "profile",
          locale: m.ogLocale,
          url: canonical,
          siteName: "Renan Miqueloti",
          title: m.fullTitle,
          description: m.description,
          profile: {
            firstName: "Renan",
            lastName: "Miqueloti",
            username: "renanmiqueloti",
          },
          images: [ogImage],
        }}
        languageAlternates={[
          { hrefLang: "pt-BR", href: `${SITE_URL}/` },
          { hrefLang: "en", href: `${SITE_URL}/en` },
          { hrefLang: "x-default", href: `${SITE_URL}/` },
        ]}
        additionalMetaTags={[
          {
            name: "twitter:card",
            content: "summary_large_image",
          },
          {
            name: "twitter:title",
            content: m.fullTitle,
          },
          {
            name: "twitter:description",
            content: m.description,
          },
          {
            name: "twitter:image",
            content: ogImage.url,
          },
          {
            name: "twitter:image:alt",
            content: ogImage.alt,
          },
        ]}
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebsiteJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getPersonJsonLd(locale)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getProfilePageJsonLd(locale)),
          }}
        />
      </Head>
      <Header />
      <main className="bg-zinc-950 text-zinc-100 min-h-screen">
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <footer className="bg-zinc-950 border-t border-zinc-900 py-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] text-zinc-600">
          <span>© {new Date().getFullYear()} · {t.footer.copyright}</span>
          <a
            href="mailto:renanmiqueloti@gmail.com"
            className="text-zinc-500 hover:text-emerald-300 transition-colors"
          >
            {t.footer.cta}
          </a>
          <span>{t.footer.version}</span>
        </div>
      </footer>
    </>
  );
};

export default Home;
