// components/Misc/AgentTerminal.component.tsx
// Terminal interativo: o site É um agent. Comandos navegam o conteúdo.
// 100% client-side — funciona em qualquer host estático (Vercel free, etc.).
//
// Comandos: help · whoami · neofetch · banner · cv · skills · projects · now ·
//           tree · ls · cat <file> · fortune · ps · uname · date · echo · history ·
//           contact · sudo hire · clear · exit

import { ReactNode, useEffect, useRef, useState, KeyboardEvent } from "react";

type Tone = "emerald" | "zinc" | "amber";

type Line =
  | { t: "user"; text: string }
  | { t: "sys"; text: string }
  | { t: "agent"; text: string }
  | { t: "agent-dim"; text: string }
  | { t: "agent-link"; text: string; url: string }
  | { t: "art"; text: string; tone?: Tone }
  | { t: "raw"; node: ReactNode }
  | { t: "err"; text: string };

const PERSONA = {
  name: "Renan Miqueloti",
  role: "AI Engineer",
  location: "Brasil · remoto",
  email: "renanmiqueloti@gmail.com",
  github: "https://github.com/RenanMiqueloti",
  linkedin: "https://www.linkedin.com/in/renanmiqueloti",
  focus: "agentes, RAG e modelos preditivos",
  approach: "do experimento ao deploy, com evals e observabilidade",
  bio: "AI Engineer focado em arquitetura de sistemas LLM.",
  bioLong:
    "Atuação em retrieval, evals e observabilidade aplicados a pipelines de IA em produção.",
};

const SKILL_LINES: [string, string][] = [
  ["01 Agents", "LangGraph, LangChain, MCP, tool-use, multi-agent, memory, guardrails"],
  ["02 LLM", "Claude, prompt engineering, embeddings, HuggingFace, fine-tuning, LoRA"],
  ["03 RAG", "chunking, hybrid search, re-ranking, Weaviate, pgvector, Qdrant"],
  ["04 ML", "PyTorch, scikit-learn, pandas, NumPy, time series, SHAP, computer vision"],
  ["05 Ops", "LangSmith, Langfuse, evals, tracing, Docker, CI/CD"],
  ["06 Infra", "Python, TypeScript, FastAPI, Pydantic, Postgres, Redis, Neo4j, AWS, GCP"],
];

const FOCUS_LINES: [string, string][] = [
  ["FOCUS", "agentes com tool-use, RAG e modelos preditivos."],
  ["MODE", "do experimento ao deploy, com evals e observabilidade."],
  ["STACK", "LangGraph, LangChain, MCP, Weaviate, Python, PyTorch, FastAPI."],
];

const EXPERIENCE_LINES: [string, string][] = [
  ["CURRENT", "AI Engineer @ Tamy AI — agentes multi-tool com handoff humano e RAG sobre bases internas."],
  ["PREVIOUS", "Data Scientist @ WEG — IA/ML para indústria (2023–2025)."],
  [
    "FOUNDATION",
    "TI / Análise de sistemas @ BirminD · estágio web @ Melhor Escola (2018–2023).",
  ],
  ["DEGREE", "Computer & Information Sciences (2019–2023)."],
];

const FORTUNES = [
  "Um LLM é uma função de texto pra texto. Tudo mais é produto.",
  "O melhor agent é o que sabe quando perguntar.",
  "Modelo bom é o que entrega. Modelo ótimo é o que entrega rápido.",
  "Toda arquitetura de agent acaba virando uma máquina de estados.",
  "Em produção, latência é UX.",
  "Não existe ML sem dados ruins.",
  "Eval primeiro, prompt depois.",
  "Retrieval bom resolve mais do que prompt longo.",
];

const ASCII_LOGO = `       ◆
      ◆◆◆
     ◆◆◆◆◆
    ◆◆◆◆◆◆◆
     ◆◆◆◆◆
      ◆◆◆
       ◆       `;

const ASCII_BANNER = ` ╦═╗╔═╗╔╗╔╔═╗╔╗╔   ╔╦╗╦╔═╗ ╦ ╦╔═╗╦  ╔═╗╔╦╗╦
 ╠╦╝║╣ ║║║╠═╣║║║   ║║║║║║═╬╗║ ║║╣ ║  ║ ║ ║ ║
 ╩╚═╚═╝╝╚╝╩ ╩╝╚╝   ╩ ╩╩╚═╝╚╚═╝╚═╝╩═╝╚═╝ ╩ ╩`;

const TREE = `~/renan.agent/
├── persona.json
├── skills.json
├── focus.log
├── experience.log
├── contact.txt
├── projects/
│   ├── agents-AI/
│   ├── rag-chatbot/
│   └── mcp-tools-server/
└── experience/
    ├── 2025-tamy-ai/      (current)
    ├── 2023-weg/          (1y 10m)
    ├── 2022-birmind/      (1y 6m)
    └── 2018-melhor-escola/`;

const PS_TABLE = `USER   PID   %CPU  %MEM  COMMAND
renan  0001  4.2   ∞     /usr/bin/agent --model=claude
renan  0042  0.1   0.5   langchain-runtime --tools=rag,vector
renan  0099  0.0   0.2   python --venv=ai
renan  0231  2.1   0.4   pytorch-fine-tune --lr=3e-5
renan  0314   *     *    you (idle, but curious)`;

const toLogLines = (label: string, items: [string, string][]): Line[] => [
  { t: "agent", text: `${label}:` },
  ...items.map<Line>(([k, v]) => ({
    t: "agent-dim",
    text: `  [${k}] ${v}`,
  })),
];

const FAKE_FILES: Record<string, () => Line[]> = {
  "persona.json": () => [
    {
      t: "art",
      tone: "amber",
      text: `{
  "name":      "${PERSONA.name}",
  "role":      "${PERSONA.role}",
  "location":  "${PERSONA.location}",
  "focus":     "${PERSONA.focus}",
  "approach":  "${PERSONA.approach}",
  "stack":     ["python", "langgraph", "claude", "pytorch", "fastapi"],
  "available": "selective"
}`,
    },
  ],
  "skills.json": () => [
    {
      t: "art",
      tone: "amber",
      text: `{
  "agents":  ["langgraph", "langchain", "mcp", "tool-use", "memory"],
  "llm":     ["claude", "prompt-eng", "embeddings", "fine-tuning", "lora"],
  "rag":     ["chunking", "hybrid-search", "re-ranking", "weaviate", "pgvector"],
  "ml":      ["pytorch", "sklearn", "time-series", "shap", "computer-vision"],
  "ops":     ["langsmith", "langfuse", "evals", "tracing", "docker", "ci/cd"],
  "infra":   ["python", "typescript", "fastapi", "pydantic", "postgres", "redis", "neo4j"]
}`,
    },
  ],
  "focus.log": () => toLogLines("focus.log", FOCUS_LINES),
  "experience.log": () => toLogLines("experience.log", EXPERIENCE_LINES),
  "contact.txt": () => [
    { t: "agent-link", text: `mail   ${PERSONA.email}`, url: `mailto:${PERSONA.email}` },
    { t: "agent-link", text: `linkin ${PERSONA.linkedin}`, url: PERSONA.linkedin },
    { t: "agent-link", text: `github ${PERSONA.github}`, url: PERSONA.github },
  ],
};

const TAB_CMDS = [
  "help", "whoami", "neofetch", "banner", "cv", "skills", "projects", "now",
  "tree", "ls", "cat persona.json", "cat skills.json", "cat focus.log",
  "cat experience.log", "cat contact.txt", "fortune", "ps", "uname", "date",
  "echo ", "history", "pwd", "contact", "clear", "sudo hire", "exit",
];

type Props = {
  initialBoot?: boolean;
  height?: number | string;
  className?: string;
};

export const AgentTerminal = ({
  initialBoot = true,
  height = 420,
  className = "",
}: Props) => {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialBoot) return;
    let cancelled = false;
    const seq: Line[] = [
      { t: "sys", text: "[boot] starting renan.agent v0.4.2 ..." },
      { t: "sys", text: "[ok]   loaded persona.json" },
      { t: "sys", text: "[ok]   tools: langgraph, langchain, mcp, rag, evals" },
      { t: "sys", text: "[ok]   model: claude" },
      { t: "sys", text: `[ready] agent online @ ${PERSONA.location}` },
      { t: "agent", text: "Olá. Sou o agent do Renan. Digite `help` ou tente `neofetch`." },
    ];
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      if (i >= seq.length) return;
      setLines((l) => [...l, seq[i]]);
      i++;
      setTimeout(tick, 200 + Math.random() * 160);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [initialBoot]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, thinking]);

  const exec = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setLines((l) => [...l, { t: "user", text: raw }]);
    setHistory((h) => [raw, ...h].slice(0, 50));
    setHIdx(-1);
    if (!cmd) return;
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      const reply = handleCommand(cmd);
      if (reply.length) setLines((l) => [...l, ...reply]);
    }, 200 + Math.random() * 280);
  };

  const handleCommand = (cmd: string): Line[] => {
    // ─── system / chrome ───────────────────────────────────────────
    if (cmd === "clear" || cmd === "cls") {
      setTimeout(() => setLines([]), 0);
      return [];
    }

    if (cmd === "help" || cmd === "?" || cmd === "ls --help") {
      const groups: [string, string][] = [
        ["INFO", "whoami · neofetch · banner · cv"],
        ["DATA", "skills · projects · now · contact"],
        ["EXPLORE", "tree · ls · cat <arquivo>"],
        ["SYSTEM", "uname · date · ps · history · clear"],
        ["FUN", "fortune · echo <txt> · sudo hire"],
      ];
      return [
        { t: "agent", text: "comandos disponíveis:" },
        {
          t: "raw",
          node: (
            <div className="font-mono text-[12.5px] leading-[1.7] mt-1 text-zinc-400">
              {groups.map(([k, v]) => (
                <div key={k}>
                  <span className="text-emerald-400 inline-block w-20">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div className="text-zinc-600 mt-2">↑/↓ histórico · Tab autocomplete</div>
            </div>
          ),
        },
      ];
    }

    // ─── neofetch (the killer feature) ────────────────────────────
    if (cmd === "neofetch" || cmd === "fetch") {
      return [
        {
          t: "raw",
          node: (
            <div className="flex flex-wrap gap-x-5 gap-y-2 my-2">
              <pre
                className="font-mono whitespace-pre text-emerald-400 leading-[1.05] m-0 shrink-0 text-[13px]"
                style={{
                  textShadow: "0 0 10px rgba(52,211,153,0.45)",
                }}
              >
                {ASCII_LOGO}
              </pre>
              <div className="font-mono text-[12.5px] leading-[1.55]">
                <div>
                  <span className="text-emerald-400 font-semibold">renan</span>
                  <span className="text-zinc-600">@</span>
                  <span className="text-emerald-400 font-semibold">agent</span>
                </div>
                <div className="text-zinc-700 mb-1">─────────────────────────────</div>
                {([
                  ["OS", "AGENT.OS v0.4.2"],
                  ["Host", "renanmiqueloti.vercel.app"],
                  ["Shell", "zsh (renan.agent)"],
                  ["Uptime", "∞ since 2018"],
                  ["Role", PERSONA.role],
                  ["Focus", PERSONA.focus],
                  ["Mode", "hands-on · honesto sobre escopo"],
                  ["Stack", "python · langgraph · claude · pytorch · fastapi"],
                ] as const).map(([k, v]) => <NeoRow key={k} k={k} v={v} />)}
                <NeoRow k="Status" v={<span><span className="text-emerald-400">● </span>online · disponível</span>} />
              </div>
            </div>
          ),
        },
      ];
    }

    // ─── banner ────────────────────────────────────────────────────
    if (cmd === "banner" || cmd === "logo") {
      return [
        { t: "art", tone: "emerald", text: ASCII_BANNER },
        { t: "agent-dim", text: "  AI Engineer · agents · ML systems" },
      ];
    }

    // ─── cv / experience timeline ─────────────────────────────────
    if (cmd === "cv" || cmd === "experience" || cmd === "carreira") {
      return [
        {
          t: "raw",
          node: (
            <div className="font-mono text-[13px] leading-[1.6] my-2">
              <div className="text-emerald-400 mb-3 tracking-[0.2em] uppercase text-[11px]">
                ◆ Timeline · Renan Miqueloti
              </div>
              <div className="space-y-3">
                {([
                  ["2025", "AI Engineer @ Tamy AI", "atual · remoto", "agentes de IA com LLMs · automação de decisões financeiras e operacionais"],
                  ["2023", "Data Scientist @ WEG", "1 ano 10 meses", "IA/ML aplicada a automação e otimização de processos industriais"],
                  ["2022", "TI / Análise de sistemas @ BirminD", "1 ano 6 meses", "Git · Looker · Python · suporte e análise"],
                  ["2018", "Estágio Web @ Melhor Escola", "1 ano 4 meses", "front-end e suporte"],
                ] as const).map(([year, title, meta, desc]) => (
                  <CvRow key={year} year={year} title={title} meta={meta} desc={desc} />
                ))}
              </div>
              <div className="text-zinc-600 mt-3 text-[12px]">
                bacharelado em Computer & Information Sciences (2019–2023)
              </div>
            </div>
          ),
        },
      ];
    }

    // ─── whoami / about ───────────────────────────────────────────
    if (cmd === "whoami" || cmd === "about" || cmd === "bio") {
      return [
        { t: "agent", text: `${PERSONA.name} — ${PERSONA.role}` },
        { t: "agent", text: PERSONA.bio },
        { t: "agent-dim", text: PERSONA.bioLong },
      ];
    }

    // ─── skills ───────────────────────────────────────────────────
    if (cmd === "skills" || cmd === "stack") {
      return [
        { t: "agent", text: "stack:" },
        ...SKILL_LINES.map<Line>(([k, v]) => ({ t: "agent-dim", text: `  ${k.padEnd(14)} ${v}` })),
      ];
    }

    if (cmd === "projects" || cmd === "proj") {
      const projs: [string, string][] = [
        ["  → agents-AI · LangGraph + MCP + HITL + evals", "https://github.com/RenanMiqueloti/agents-AI"],
        ["  → rag-chatbot · Qdrant + hybrid retrieval + cross-encoder rerank", "https://github.com/RenanMiqueloti/rag-chatbot"],
        ["  → mcp-tools-server · custom MCP server", "https://github.com/RenanMiqueloti/mcp-tools-server"],
        ["  → todos os repos públicos", PERSONA.github],
      ];
      return [
        { t: "agent", text: "projetos:" },
        ...projs.map<Line>(([text, url]) => ({ t: "agent-link", text, url })),
      ];
    }

    if (cmd === "now" || cmd === "currently") {
      return [
        { t: "agent", text: "focus:" },
        ...FOCUS_LINES.map<Line>(([k, v]) => ({ t: "agent-dim", text: `  [${k}] ${v}` })),
      ];
    }

    if (cmd === "contact" || cmd === "email") {
      const links: [string, string][] = [
        [`  mail   ${PERSONA.email}`, `mailto:${PERSONA.email}`],
        [`  linkin ${PERSONA.linkedin}`, PERSONA.linkedin],
        [`  github ${PERSONA.github}`, PERSONA.github],
      ];
      return [
        { t: "agent", text: "contato:" },
        ...links.map<Line>(([text, url]) => ({ t: "agent-link", text, url })),
      ];
    }

    if (cmd === "tree") return [{ t: "art", tone: "zinc", text: TREE }];

    if (cmd === "ls" || cmd === "dir" || cmd === "ll") {
      return [
        { t: "art", tone: "zinc", text: "persona.json   skills.json   focus.log   experience.log   contact.txt   projects/   experience/" },
        { t: "agent-dim", text: "tip: `cat <arquivo>` para ler · `tree` para a árvore completa." },
      ];
    }

    if (cmd.startsWith("cat ")) {
      const file = cmd.slice(4).trim().replace(/^\.\//, "");
      const fn = FAKE_FILES[file];
      if (fn) return fn();
      return [{ t: "err", text: `cat: ${file}: arquivo não encontrado. tente \`ls\`.` }];
    }

    if (cmd === "uname" || cmd === "uname -a") {
      return [{ t: "agent-dim", text: "AGENT.OS 0.4.2 renan.agent x86_64 GNU/JS (browser-native)" }];
    }

    if (cmd === "date") {
      return [{ t: "agent-dim", text: new Date().toString().replace(/\s\(.+\)$/, "") }];
    }

    if (cmd === "ps" || cmd === "ps aux" || cmd === "top") {
      return [{ t: "art", tone: "zinc", text: PS_TABLE }];
    }

    if (cmd === "history") {
      if (history.length === 0)
        return [{ t: "agent-dim", text: "nenhum comando ainda. tente `help`." }];
      return [
        { t: "agent", text: "história:" },
        ...history.slice(0, 20).reverse().map<Line>((c, i) => ({
          t: "agent-dim",
          text: `  ${(i + 1).toString().padStart(3)}  ${c}`,
        })),
      ];
    }

    if (cmd.startsWith("echo")) {
      return [{ t: "agent-dim", text: cmd.slice(4).trim() }];
    }

    if (cmd === "pwd") return [{ t: "agent-dim", text: "/home/renan/renan.agent" }];

    if (cmd === "exit" || cmd === "logout" || cmd === "quit") {
      return [
        { t: "agent", text: "agent: terminal embarcado — sem destino para sair." },
        { t: "agent-dim", text: "use `clear` para limpar a tela." },
      ];
    }

    if (cmd === "fortune") {
      return [
        { t: "agent", text: `"${FORTUNES[Math.floor(Math.random() * FORTUNES.length)]}"` },
        { t: "agent-dim", text: "  — anônimo." },
      ];
    }

    if (cmd.startsWith("sudo")) {
      if (cmd.includes("hire") || cmd.includes("contratar")) {
        return [
          { t: "agent", text: "abrindo canal." },
          { t: "agent-link", text: `  → ${PERSONA.email}`, url: `mailto:${PERSONA.email}` },
        ];
      }
      return [{ t: "err", text: cmd.includes("rm") ? "sudo: terminal read-only." : "sudo: permissão negada." }];
    }

    // ─── greetings ────────────────────────────────────────────────
    if (["hi", "olá", "ola", "oi", "echo hello", "hello"].includes(cmd)) {
      return [{ t: "agent", text: "👋 oi. tente `help` ou `neofetch`." }];
    }

    return [{ t: "err", text: `comando não encontrado: ${cmd}. tente \`help\`.` }];
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const ni = Math.min(hIdx + 1, history.length - 1);
      setHIdx(ni);
      if (history[ni] != null) setInput(history[ni]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const ni = Math.max(hIdx - 1, -1);
      setHIdx(ni);
      setInput(ni === -1 ? "" : history[ni]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const m = TAB_CMDS.find((c) => c.startsWith(input.toLowerCase()));
      if (m) setInput(m);
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest("a,button,input,textarea,select,label,[role='button']"))
          return;
        inputRef.current?.focus();
      }}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
      className={`flex flex-col bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 rounded-lg overflow-hidden font-mono text-[13px] leading-[1.55] text-zinc-200 cursor-text ${className}`}
    >
      <div
        ref={scrollRef}
        className="flex-1 px-3.5 py-3 overflow-y-auto overflow-x-hidden"
      >
        {lines.map((ln, i) => (
          <TermLine key={i} ln={ln} />
        ))}
        {thinking && (
          <div className="text-zinc-500">
            <span className="text-emerald-400">agent</span>
            <span className="text-zinc-600"> · thinking</span>
            <Dots />
          </div>
        )}
        <div className="flex items-center mt-1">
          <span className="text-emerald-400 mr-2 whitespace-nowrap">
            guest@renan.agent
          </span>
          <span className="text-zinc-600 mr-1.5">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-zinc-200 caret-emerald-400 font-mono text-[13px]"
            placeholder="try: neofetch"
          />
        </div>
      </div>
    </div>
  );
};

function TermLine({ ln }: { ln: Line }) {
  if (!ln) return null;
  if (ln.t === "user")
    return (
      <div className="text-zinc-200">
        <span className="text-emerald-400 mr-2">guest@renan.agent</span>
        <span className="text-zinc-600 mr-1.5">$</span>
        <span>{ln.text}</span>
      </div>
    );
  if (ln.t === "sys") return <div className="text-zinc-600">{ln.text}</div>;
  if (ln.t === "agent")
    return (
      <div className="text-zinc-200">
        <span className="text-emerald-400">agent</span>
        <span className="text-zinc-600"> · </span>
        <span dangerouslySetInnerHTML={{ __html: formatTicks(ln.text) }} />
      </div>
    );
  if (ln.t === "agent-dim") return <div className="text-zinc-500">{ln.text}</div>;
  if (ln.t === "agent-link")
    return (
      <div className="text-zinc-500">
        <a
          href={ln.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 underline underline-offset-[3px] hover:text-emerald-300"
        >
          {ln.text}
        </a>
      </div>
    );
  if (ln.t === "art") {
    const tone =
      ln.tone === "emerald"
        ? "text-emerald-400"
        : ln.tone === "amber"
        ? "text-amber-400"
        : "text-zinc-400";
    const glow =
      ln.tone === "emerald"
        ? { textShadow: "0 0 8px rgba(52,211,153,0.4)" }
        : undefined;
    return (
      <pre
        className={`font-mono whitespace-pre m-0 leading-[1.15] text-[13px] ${tone}`}
        style={glow}
      >
        {ln.text}
      </pre>
    );
  }
  if (ln.t === "raw") return <div>{ln.node}</div>;
  if (ln.t === "err") return <div className="text-red-400">{ln.text}</div>;
  return null;
}

function NeoRow({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex">
      <span className="text-emerald-400 w-20 shrink-0">{k}:</span>
      <span className="text-zinc-300">{v}</span>
    </div>
  );
}

function CvRow({
  year,
  title,
  meta,
  desc,
}: {
  year: string;
  title: string;
  meta: string;
  desc: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-emerald-400 font-semibold">◆ {year}</span>
        <span className="text-zinc-200">— {title}</span>
        <span className="text-zinc-600 text-[11.5px]">· {meta}</span>
      </div>
      <div className="text-zinc-500 ml-4 text-[12.5px]">{desc}</div>
    </div>
  );
}

function formatTicks(s: string) {
  return s.replace(
    /`([^`]+)`/g,
    `<code style="background:rgba(127,127,127,0.15);padding:1px 6px;border-radius:4px;color:#34D399">$1</code>`
  );
}

function Dots() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v % 3) + 1), 300);
    return () => clearInterval(id);
  }, []);
  return <span>{".".repeat(n)}</span>;
}

export default AgentTerminal;
