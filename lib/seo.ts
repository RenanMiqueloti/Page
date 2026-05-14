export const SITE_URL = "https://renanmiqueloti.vercel.app";
const NAME = "Renan Miqueloti";
const URL_ROOT = `${SITE_URL}/`;
const URL_EN = `${SITE_URL}/en`;
const PERSON_ID = `${URL_ROOT}#person`;
const WEBSITE_ID = `${URL_ROOT}#website`;

export type SeoLocale = "pt" | "en";

const urlFor = (locale: SeoLocale) => (locale === "en" ? URL_EN : URL_ROOT);

const PERSON_DESCRIPTION: Record<SeoLocale, string> = {
  pt: "Renan Miqueloti constrói agentes com tool-use, MCP, RAG e modelos preditivos — com evals, observabilidade e foco em qualidade de engenharia.",
  en: "Renan Miqueloti builds agents with tool-use, MCP, RAG and predictive models — with evals, observability and engineering quality.",
};

const OG_IMAGE_ALT: Record<SeoLocale, string> = {
  pt: "Renan Miqueloti — AI Engineer · agentes, RAG, observabilidade",
  en: "Renan Miqueloti — AI Engineer · agents, RAG, observability",
};

export const AVATAR_URL = `${SITE_URL}/assets/avatar.png`;

export const getOgImage = (locale: SeoLocale) => ({
  url: `${SITE_URL}/og.png`,
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT[locale],
  type: "image/png",
});

export const getWebsiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: NAME,
  url: URL_ROOT,
  inLanguage: ["pt-BR", "en"],
});

export const getPersonJsonLd = (locale: SeoLocale) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: NAME,
  url: URL_ROOT,
  image: AVATAR_URL,
  jobTitle: "AI Engineer",
  description: PERSON_DESCRIPTION[locale],
  address: { "@type": "PostalAddress", addressCountry: "BR" },
  email: "renanmiqueloti@gmail.com",
  sameAs: [
    "https://www.linkedin.com/in/renanmiqueloti",
    "https://github.com/RenanMiqueloti",
  ],
  knowsAbout: [
    "AI Engineering", "Agentic AI", "Machine Learning", "LLMs",
    "LangChain", "LangGraph", "Model Context Protocol (MCP)", "RAG",
    "Evals", "MLOps", "Observability", "LangSmith", "Langfuse",
    "AWS", "GCP", "Python", "PyTorch",
  ],
});

export const getProfilePageJsonLd = (locale: SeoLocale) => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  inLanguage: locale === "en" ? "en" : "pt-BR",
  url: urlFor(locale),
  name: NAME,
  mainEntity: { "@id": PERSON_ID },
});
