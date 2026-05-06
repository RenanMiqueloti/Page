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
    ctaCal: string;
    ctaCalUrl: string;
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
      title: "Renan Miqueloti — AI Engineer · agentes, RAG e observabilidade",
      fullTitle: "Renan Miqueloti — AI Engineer · agentes, RAG e observabilidade",
      description:
        "AI Engineer no Brasil. Agentes multi-turn (LangGraph), pipelines RAG e evals em produção. Aberto a conversas.",
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
        " — agentes, RAG e ML aplicado. Foco em arquitetura de sistemas LLM com avaliação contínua, observabilidade e retrieval performático.",
      bridgeForNonTech:
        "5 anos de experiência em IA aplicada, com 2 dedicados a sistemas multi-agente e RAG.",
      ctaPrimary: "$ ver projetos",
      ctaSecondary: "vamos conversar",
      avatarFooter: "Brasil · remoto",
      expWindowTitle: "experience.log",
      whoamiWindowTitle: "whoami.cfg",
      terminalWindowTitle: "~/renan.agent — zsh",
      terminalHint: "interativo · digite 'help' ou 'neofetch'",
      experience: [
        {
          tag: "[CURRENT]",
          text: "AI Engineer @ Tamy AI — agentes multi-tool com handoff humano e RAG sobre bases internas.",
        },
        {
          tag: "[PREVIOUS]",
          text: "Data Scientist @ WEG — soluções de machine learning para automação industrial e otimização de processos (2023–2025).",
        },
        {
          tag: "[FOUNDATION]",
          text: "TI & análise de sistemas @ BirminD · estágio web @ Melhor Escola (2018–2023).",
        },
        {
          tag: "[DEGREE]",
          text: "Computer & Information Sciences (2019–2023).",
        },
      ],
      whoami: [
        { key: "host", value: "renan@agent" },
        { key: "role", value: "ai engineer" },
        { key: "focus", value: "agents · rag · evals · mlops" },
        { key: "stack", value: "python · langgraph · mcp · pytorch · fastapi" },
        { key: "since", value: "2021 · ai/ml aplicado · 2024 · agentes" },
        { key: "location", value: "remoto · brasil · gmt-3" },
        { key: "langs", value: "pt-br (nativo) · en (intermediário · B2)" },
        { key: "status", value: "mid/senior · contratação pj" },
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
            "Prompt Engineering",
            "Embeddings",
            "Hugging Face",
            "Fine-tuning",
            "LoRA",
            "OpenAI GPT",
          ],
        },
        {
          eyebrow: "03",
          file: "rag.exe",
          title: "RAG & Retrieval",
          items: [
            "RAG",
            "Chunking",
            "Hybrid Search",
            "Re-ranking",
            "Weaviate",
            "pgvector",
            "Qdrant",
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
            "NumPy",
            "Time Series",
            "SHAP",
            "Streamlit",
            "Computer Vision",
            "CNN",
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
            "Docker",
            "CI/CD",
            "Monitoring",
          ],
        },
        {
          eyebrow: "06",
          file: "infra.exe",
          title: "Backend & Infra",
          items: [
            "Python",
            "TypeScript",
            "FastAPI",
            "Pydantic",
            "Postgres",
            "Redis",
            "Neo4j",
            "React",
            "AWS",
            "GCP",
          ],
        },
      ],
    },
    projects: {
      eyebrow: "// 03 · projects",
      title: "Selected work",
      intro:
        "Repositórios e experimentos públicos em retrieval, ML aplicado e sistemas com agentes. Os projetos principais permanecem confidenciais.",
      featured: {
        label: "DESTAQUE",
        title: "agents-AI",
        description:
          "Referência de padrões de produção para agentes de IA: MCP server customizado com 4 ferramentas expostas via stdio, LangGraph HITL e multi-provider (Ollama / Claude / OpenAI) — tudo em um único repositório executável.",
        tags: ["LangGraph", "MCP", "LangChain", "RAG", "Evals"],
        url: SHARED_FEATURED_URL,
        cta: "Ver perfil no GitHub",
      },
      secondary: [
        {
          label: "DESTAQUE",
          title: "industrial-anomaly-detection",
          description:
            "Detecção de anomalias não supervisionada em séries temporais industriais (dataset IMS/NASA): Isolation Forest, LOF, OC-SVM, AutoEncoder (PyTorch) e SHAP para explicabilidade. Bootstrap CI e dashboard Streamlit para visualização.",
          tags: ["Python", "PyTorch", "SHAP", "Streamlit", "Anomaly Detection"],
          url: "https://github.com/RenanMiqueloti/industrial-anomaly-detection",
          cta: "Ver no GitHub",
        },
        {
          label: "DESTAQUE",
          title: "rag-chatbot",
          description:
            "Pipeline RAG de produção com LangGraph orquestrando retrieve → rerank → generate. Hybrid retrieval BM25 + semantic com RRF, cross-encoder re-ranking, FastAPI streaming e harness de evals com LLM-as-judge (relevância, faithfulness, completeness).",
          tags: ["LangGraph", "Qdrant", "Hybrid + Rerank", "FastAPI"],
          url: "https://github.com/RenanMiqueloti/rag-chatbot",
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
      ctaCal: "$ agendar uma conversa",
      ctaCalUrl: "https://cal.com/renanmiqueloti",
    },
    footer: {
      copyright: "Renan Miqueloti",
      version: "pt-br · en",
      cta: "$ aberto a contratos pj e consultoria · renanmiqueloti@gmail.com",
    },
  },
  en: {
    meta: {
      title: "Renan Miqueloti — AI Engineer · agents, RAG and observability",
      fullTitle: "Renan Miqueloti — AI Engineer · agents, RAG and observability",
      description:
        "AI Engineer based in Brazil. Multi-turn agents (LangGraph), RAG pipelines and evals in production. Open to conversations.",
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
        " — agents, RAG and applied ML. Focused on LLM system architecture with continuous evaluation, observability and performant retrieval.",
      bridgeForNonTech:
        "5 years of experience in applied AI, with 2 dedicated to multi-agent systems and RAG.",
      ctaPrimary: "$ see projects",
      ctaSecondary: "let's talk",
      avatarFooter: "Brazil · remote",
      expWindowTitle: "experience.log",
      whoamiWindowTitle: "whoami.cfg",
      terminalWindowTitle: "~/renan.agent — zsh",
      terminalHint: "interactive · type 'help' or 'neofetch'",
      experience: [
        {
          tag: "[CURRENT]",
          text: "AI Engineer @ Tamy AI — multi-tool agents with human handoff and RAG over internal knowledge bases.",
        },
        {
          tag: "[PREVIOUS]",
          text: "Data Scientist @ WEG — machine learning solutions for industrial automation and process optimization (2023–2025).",
        },
        {
          tag: "[FOUNDATION]",
          text: "IT & systems analysis @ BirminD · web internship @ Melhor Escola (2018–2023).",
        },
        {
          tag: "[DEGREE]",
          text: "Computer & Information Sciences (2019–2023).",
        },
      ],
      whoami: [
        { key: "host", value: "renan@agent" },
        { key: "role", value: "ai engineer" },
        { key: "focus", value: "agents · rag · evals · mlops" },
        { key: "stack", value: "python · langgraph · mcp · pytorch · fastapi" },
        { key: "since", value: "2021 · applied ai/ml · 2024 · agents" },
        { key: "location", value: "remote · brazil · gmt-3" },
        { key: "langs", value: "en (upper-intermediate · B2) · pt-br (native)" },
        { key: "status", value: "mid/senior · contractor (pj)" },
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
            "Prompt Engineering",
            "Embeddings",
            "Hugging Face",
            "Fine-tuning",
            "LoRA",
            "OpenAI GPT",
          ],
        },
        {
          eyebrow: "03",
          file: "rag.exe",
          title: "RAG & Retrieval",
          items: [
            "RAG",
            "Chunking",
            "Hybrid Search",
            "Re-ranking",
            "Weaviate",
            "pgvector",
            "Qdrant",
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
            "NumPy",
            "Time Series",
            "SHAP",
            "Streamlit",
            "Computer Vision",
            "CNN",
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
            "Docker",
            "CI/CD",
            "Monitoring",
          ],
        },
        {
          eyebrow: "06",
          file: "infra.exe",
          title: "Backend & Infra",
          items: [
            "Python",
            "TypeScript",
            "FastAPI",
            "Pydantic",
            "Postgres",
            "Redis",
            "Neo4j",
            "React",
            "AWS",
            "GCP",
          ],
        },
      ],
    },
    projects: {
      eyebrow: "// 03 · projects",
      title: "Selected work",
      intro:
        "Public repos and experiments in retrieval, applied ML and agent-based systems. The primary projects remain confidential.",
      featured: {
        label: "FEATURED",
        title: "agents-AI",
        description:
          "Production patterns reference for AI agents: custom MCP server with 4 tools exposed via stdio, LangGraph HITL and multi-provider (Ollama / Claude / OpenAI) — all in a single runnable repository.",
        tags: ["LangGraph", "MCP", "LangChain", "RAG", "Evals"],
        url: SHARED_FEATURED_URL,
        cta: "View GitHub profile",
      },
      secondary: [
        {
          label: "FEATURED",
          title: "industrial-anomaly-detection",
          description:
            "Unsupervised anomaly detection on industrial time-series (IMS/NASA dataset): Isolation Forest, LOF, OC-SVM, AutoEncoder (PyTorch) and SHAP for explainability. Bootstrap confidence intervals and Streamlit dashboard for visualization.",
          tags: ["Python", "PyTorch", "SHAP", "Streamlit", "Anomaly Detection"],
          url: "https://github.com/RenanMiqueloti/industrial-anomaly-detection",
          cta: "View on GitHub",
        },
        {
          label: "FEATURED",
          title: "rag-chatbot",
          description:
            "Production RAG pipeline with LangGraph orchestrating retrieve → rerank → generate. Hybrid retrieval BM25 + semantic with RRF, cross-encoder re-ranking, FastAPI streaming and an LLM-as-judge eval harness (relevance, faithfulness, completeness).",
          tags: ["LangGraph", "Qdrant", "Hybrid + Rerank", "FastAPI"],
          url: "https://github.com/RenanMiqueloti/rag-chatbot",
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
      ctaCal: "$ schedule a call",
      ctaCalUrl: "https://cal.com/renanmiqueloti",
    },
    footer: {
      copyright: "Renan Miqueloti",
      version: "pt-br · en",
      cta: "$ open to contract work and consulting · renanmiqueloti@gmail.com",
    },
  },
};
