export type Locale = "pt" | "en";

export const DEFAULT_LOCALE: Locale = "pt";

type StackCategory = {
  eyebrow: string;
  file: string;
  title: string;
  items: string[];
};

type Project = {
  label: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
  cta: string;
};

type ExperienceLine = { tag: string; text: string };
type WhoamiLine = { key: string; value: string };

export type Messages = {
  meta: {
    title: string;
    fullTitle: string;
    description: string;
    ogLocale: string;
  };
  header: {
    nav: { id: string; label: string }[];
    statusOnline: string;
    localeToggleLabel: string;
  };
  about: {
    eyebrow: string;
    lastBuild: string;
    subtitleStrong: string;
    subtitleBody: string;
    bridgeForNonTech: string;
    ctaPrimary: string;
    ctaSecondary: string;
    avatarFooter: string;
    expWindowTitle: string;
    whoamiWindowTitle: string;
    terminalWindowTitle: string;
    terminalHint: string;
    experience: ExperienceLine[];
    whoami: WhoamiLine[];
  };
  skills: {
    eyebrow: string;
    title: string;
    intro: string;
    categories: StackCategory[];
  };
  projects: {
    eyebrow: string;
    title: string;
    intro: string;
    featured: Project;
    secondary: Project[];
    seeAllCta: string;
    seeAllUrl: string;
    comingSoonLabel: string;
    comingSoonCta: string;
    unavailableLabel: string;
  };
  contact: {
    eyebrow: string;
    headline: string;
    body: string;
    ctaEmail: string;
  };
  footer: {
    copyright: string;
    version: string;
    cta: string;
  };
};

const SHARED_FEATURED_URL = "https://github.com/RenanMiqueloti";

export const MESSAGES: Record<Locale, Messages> = {
  pt: {
    meta: {
      title: "Renan Miqueloti — AI Engineer · agents, RAG e observabilidade",
      fullTitle: "Renan Miqueloti — AI Engineer · agents, RAG e observabilidade",
      description:
        "AI Engineer no Brasil. AI Ops, deploy de agents em produção, pipelines RAG e LangGraph. Aberto a conversas.",
      ogLocale: "pt_BR",
    },
    header: {
      nav: [
        { id: "about", label: "about" },
        { id: "skills", label: "stack" },
        { id: "projects", label: "projects" },
        { id: "contact", label: "contact" },
      ],
      statusOnline: "online",
      localeToggleLabel: "EN",
    },
    about: {
      eyebrow: "// 01 · about",
      lastBuild: "última atualização",
      subtitleStrong: "AI Engineer",
      subtitleBody:
        " — sistemas com LLMs e ML aplicado.",
      bridgeForNonTech: "5 anos em IA aplicada · 2 em agents, RAG e AI Ops.",
      ctaPrimary: "$ ver projetos",
      ctaSecondary: "vamos conversar",
      avatarFooter: "Brasil · remoto",
      expWindowTitle: "experience.log",
      whoamiWindowTitle: "whoami.cfg",
      terminalWindowTitle: "~/renan.agent — zsh",
      terminalHint: "interativo · digite 'help' ou 'neofetch'",
      experience: [
        {
          tag: "[PJ]",
          text: "miqueloti.tech (2025–)",
        },
        {
          tag: "[  └─ now]",
          text: "AI Ops Engineer — deploy e orquestração de agents em produção.",
        },
        {
          tag: "[  └─ prev]",
          text: "AI Engineer @ Tamy AI — agents HITL e RAG (2025–2026).",
        },
        {
          tag: "[PREVIOUS]",
          text: "Data Scientist @ WEG — ML para automação industrial (2023–2025).",
        },
        {
          tag: "[FOUNDATION]",
          text: "TI & análise de sistemas @ BirminD (2021–2023).",
        },
        {
          tag: "[INTERN]",
          text: "Estágio web @ Melhor Escola (2019–2021).",
        },
        {
          tag: "[DEGREE]",
          text: "Computer & Information Sciences (2019–2023).",
        },
      ],
      whoami: [
        { key: "host", value: "renan@agent" },
        { key: "role", value: "ai engineer · mid/senior · pj" },
        { key: "focus", value: "aiops · agents · rag · mlops" },
        { key: "stack", value: "python · langgraph · aws · fastapi · mcp" },
        { key: "since", value: "2021 (ai/ml) · 2024 (agents)" },
        { key: "location", value: "remoto · brasil · gmt-3" },
        { key: "langs", value: "pt-br (nativo) · en (B2)" },
      ],
    },
    skills: {
      eyebrow: "// 02 · stack",
      title: "Stack",
      intro:
        "Listas ordenadas por frequência de uso. Os primeiros itens fazem parte do meu dia a dia; os demais entram conforme o projeto.",
      categories: [
        {
          eyebrow: "01",
          file: "agents.exe",
          title: "Agents & Orchestration",
          items: [
            "LangGraph",
            "LangChain",
            "MCP",
            "Tool-use",
            "Multi-agent",
            "Memory",
            "Guardrails",
          ],
        },
        {
          eyebrow: "02",
          file: "llm.exe",
          title: "LLM Stack",
          items: [
            "Anthropic Claude",
            "OpenAI GPT",
            "Prompt Engineering",
            "Embeddings",
            "Hugging Face",
          ],
        },
        {
          eyebrow: "03",
          file: "rag.exe",
          title: "RAG & Retrieval",
          items: [
            "RAG",
            "Hybrid Search",
            "Re-ranking",
            "Qdrant",
            "pgvector",
          ],
        },
        {
          eyebrow: "04",
          file: "ml.exe",
          title: "ML & Data",
          items: [
            "PyTorch",
            "scikit-learn",
            "pandas",
            "Time Series",
            "Computer Vision",
          ],
        },
        {
          eyebrow: "05",
          file: "ops.exe",
          title: "MLOps & Observability",
          items: [
            "LangSmith",
            "Langfuse",
            "Evals",
            "Tracing",
            "Grafana",
            "Datadog",
            "Docker",
            "CI/CD",
          ],
        },
        {
          eyebrow: "06",
          file: "infra.exe",
          title: "Backend & Infra",
          items: [
            "Python",
            "FastAPI",
            "Pydantic",
            "AWS",
            "GCP",
            "Postgres",
            "Redis",
            "TypeScript",
          ],
        },
      ],
    },
    projects: {
      eyebrow: "// 03 · projects",
      title: "Selected work",
      intro:
        "Repositórios e projetos públicos em retrieval, ML aplicado e sistemas com agents. Os projetos profissionais permanecem confidenciais.",
      featured: {
        label: "DESTAQUE",
        title: "rag-chatbot",
        description:
          "Pipeline RAG com LangGraph orquestrando retrieve → rerank → generate. Hybrid retrieval BM25 + semantic com RRF, cross-encoder re-ranking, FastAPI streaming e harness de evals com LLM-as-judge (relevância, faithfulness, completeness).",
        tags: ["LangGraph", "Qdrant", "Hybrid + Rerank", "FastAPI"],
        url: "https://renanmiq-rag-chatbot.hf.space",
        cta: "Ver demo",
      },
      secondary: [
        {
          label: "DESTAQUE",
          title: "agents-AI",
          description:
            "Projeto executável de agents de IA: MCP server customizado com 4 ferramentas expostas via stdio, LangGraph HITL e multi-provider (Ollama / Claude / OpenAI).",
          tags: ["LangGraph", "MCP", "LangChain"],
          url: "https://github.com/RenanMiqueloti/agents-AI",
          cta: "Ver no GitHub",
        },
        {
          label: "DESTAQUE",
          title: "mcp-tools-server",
          description:
            "MCP server customizado com 6 ferramentas utilitárias expostas via stdio: datetime, calculate, text_stats, json_extract, search_knowledge e http_get. Compatível com Claude Desktop e qualquer cliente MCP.",
          tags: ["Python", "MCP", "Claude", "LangGraph"],
          url: "https://github.com/RenanMiqueloti/mcp-tools-server",
          cta: "Ver no GitHub",
        },
      ],
      seeAllCta: "$ ver todos os repos no GitHub",
      seeAllUrl: SHARED_FEATURED_URL,
      comingSoonLabel: "WIP",
      comingSoonCta: "$ em breve",
      unavailableLabel: "INDISPONÍVEL",
    },
    contact: {
      eyebrow: "// 04 · contact",
      headline: "Vamos conversar.",
      body: "Aberto a conversas sobre AI Engineering. Pleno/sênior, contratação PJ, remoto a partir do Brasil.",
      ctaEmail: "$ enviar mensagem",
    },
    footer: {
      copyright: "Renan Miqueloti",
      version: "pt-br · en",
      cta: "$ aberto a contratos pj · renanmiqueloti@gmail.com",
    },
  },
  en: {
    meta: {
      title: "Renan Miqueloti — AI Engineer · agents, RAG and observability",
      fullTitle: "Renan Miqueloti — AI Engineer · agents, RAG and observability",
      description:
        "AI Engineer based in Brazil. AI Ops, production agent deployment, LangGraph and RAG pipelines. Open to conversations.",
      ogLocale: "en_US",
    },
    header: {
      nav: [
        { id: "about", label: "about" },
        { id: "skills", label: "stack" },
        { id: "projects", label: "projects" },
        { id: "contact", label: "contact" },
      ],
      statusOnline: "online",
      localeToggleLabel: "PT",
    },
    about: {
      eyebrow: "// 01 · about",
      lastBuild: "last updated",
      subtitleStrong: "AI Engineer",
      subtitleBody:
        " — LLM systems and applied ML.",
      bridgeForNonTech: "5 years in applied AI · 2 in agents, RAG and AI Ops.",
      ctaPrimary: "$ see projects",
      ctaSecondary: "let's talk",
      avatarFooter: "Brazil · remote",
      expWindowTitle: "experience.log",
      whoamiWindowTitle: "whoami.cfg",
      terminalWindowTitle: "~/renan.agent — zsh",
      terminalHint: "interactive · type 'help' or 'neofetch'",
      experience: [
        {
          tag: "[PJ]",
          text: "miqueloti.tech (2025–)",
        },
        {
          tag: "[  └─ now]",
          text: "AI Ops Engineer — production agent deployment and orchestration.",
        },
        {
          tag: "[  └─ prev]",
          text: "AI Engineer @ Tamy AI — HITL agents and RAG (2025–2026).",
        },
        {
          tag: "[PREVIOUS]",
          text: "Data Scientist @ WEG — ML for industrial automation (2023–2025).",
        },
        {
          tag: "[FOUNDATION]",
          text: "IT & systems analysis @ BirminD (2021–2023).",
        },
        {
          tag: "[INTERN]",
          text: "Web internship @ Melhor Escola (2019–2021).",
        },
        {
          tag: "[DEGREE]",
          text: "Computer & Information Sciences (2019–2023).",
        },
      ],
      whoami: [
        { key: "host", value: "renan@agent" },
        { key: "role", value: "ai engineer · mid/senior · contractor (pj)" },
        { key: "focus", value: "aiops · agents · rag · mlops" },
        { key: "stack", value: "python · langgraph · aws · fastapi · mcp" },
        { key: "since", value: "2021 (ai/ml) · 2024 (agents)" },
        { key: "location", value: "remote · brazil · gmt-3" },
        { key: "langs", value: "en (B2) · pt-br (native)" },
      ],
    },
    skills: {
      eyebrow: "// 02 · stack",
      title: "Stack",
      intro:
        "Lists ordered by usage frequency. The leading items are part of my day-to-day; the rest come in as the project demands.",
      categories: [
        {
          eyebrow: "01",
          file: "agents.exe",
          title: "Agents & Orchestration",
          items: [
            "LangGraph",
            "LangChain",
            "MCP",
            "Tool-use",
            "Multi-agent",
            "Memory",
            "Guardrails",
          ],
        },
        {
          eyebrow: "02",
          file: "llm.exe",
          title: "LLM Stack",
          items: [
            "Anthropic Claude",
            "OpenAI GPT",
            "Prompt Engineering",
            "Embeddings",
            "Hugging Face",
          ],
        },
        {
          eyebrow: "03",
          file: "rag.exe",
          title: "RAG & Retrieval",
          items: [
            "RAG",
            "Hybrid Search",
            "Re-ranking",
            "Qdrant",
            "pgvector",
          ],
        },
        {
          eyebrow: "04",
          file: "ml.exe",
          title: "ML & Data",
          items: [
            "PyTorch",
            "scikit-learn",
            "pandas",
            "Time Series",
            "Computer Vision",
          ],
        },
        {
          eyebrow: "05",
          file: "ops.exe",
          title: "MLOps & Observability",
          items: [
            "LangSmith",
            "Langfuse",
            "Evals",
            "Tracing",
            "Grafana",
            "Datadog",
            "Docker",
            "CI/CD",
          ],
        },
        {
          eyebrow: "06",
          file: "infra.exe",
          title: "Backend & Infra",
          items: [
            "Python",
            "FastAPI",
            "Pydantic",
            "AWS",
            "GCP",
            "Postgres",
            "Redis",
            "TypeScript",
          ],
        },
      ],
    },
    projects: {
      eyebrow: "// 03 · projects",
      title: "Selected work",
      intro:
        "Public repos and projects in retrieval, applied ML and agent-based systems. Professional projects remain confidential.",
      featured: {
        label: "FEATURED",
        title: "rag-chatbot",
        description:
          "RAG pipeline with LangGraph orchestrating retrieve → rerank → generate. Hybrid retrieval BM25 + semantic with RRF, cross-encoder re-ranking, FastAPI streaming and an LLM-as-judge eval harness (relevance, faithfulness, completeness).",
        tags: ["LangGraph", "Qdrant", "Hybrid + Rerank", "FastAPI"],
        url: "https://renanmiq-rag-chatbot.hf.space",
        cta: "View demo",
      },
      secondary: [
        {
          label: "FEATURED",
          title: "agents-AI",
          description:
            "Runnable project for AI agents: custom MCP server with 4 tools exposed via stdio, LangGraph HITL and multi-provider (Ollama / Claude / OpenAI).",
          tags: ["LangGraph", "MCP", "LangChain"],
          url: "https://github.com/RenanMiqueloti/agents-AI",
          cta: "View on GitHub",
        },
        {
          label: "FEATURED",
          title: "mcp-tools-server",
          description:
            "Custom MCP server with 6 utility tools exposed via stdio: datetime, calculate, text_stats, json_extract, search_knowledge and http_get. Compatible with Claude Desktop and any MCP client.",
          tags: ["Python", "MCP", "Claude", "LangGraph"],
          url: "https://github.com/RenanMiqueloti/mcp-tools-server",
          cta: "View on GitHub",
        },
      ],
      seeAllCta: "$ see all repos on GitHub",
      seeAllUrl: SHARED_FEATURED_URL,
      comingSoonLabel: "WIP",
      comingSoonCta: "$ coming soon",
      unavailableLabel: "UNAVAILABLE",
    },
    contact: {
      eyebrow: "// 04 · contact",
      headline: "Let's talk.",
      body: "Open to AI Engineering conversations. Mid/senior, contractor (PJ), remote from Brazil.",
      ctaEmail: "$ send a message",
    },
    footer: {
      copyright: "Renan Miqueloti",
      version: "pt-br · en",
      cta: "$ open to contract work · renanmiqueloti@gmail.com",
    },
  },
};
