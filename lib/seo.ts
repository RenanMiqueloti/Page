export const SITE_URL = "https://renanmiqueloti.vercel.app";
const NAME = "Renan Miqueloti";
const URL_ROOT = `${SITE_URL}/`;

export const OG_IMAGE = {
  url: `${SITE_URL}/assets/avatar.png`,
  width: 600,
  height: 600,
  alt: "Renan Miqueloti - AI Engineer",
};

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: NAME,
  url: URL_ROOT,
  inLanguage: ["pt-BR", "en"],
};

export const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: NAME,
  url: URL_ROOT,
  image: OG_IMAGE.url,
  jobTitle: "AI Engineer",
  description:
    "Renan Miqueloti constrói agentes com tool-use, MCP, RAG e modelos preditivos — com evals, observabilidade e foco em produção.",
  address: { "@type": "PostalAddress", addressCountry: "BR" },
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
};
