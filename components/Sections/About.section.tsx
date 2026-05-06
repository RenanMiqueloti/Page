import Image from "next/image";
import { Reveal } from "../Misc/Reveal.component";
import { Window } from "../Misc/Window.component";
import { AgentTerminal } from "../Misc/AgentTerminal.component";
import { useT } from "../../lib/useLocale";

const About = () => {
  const t = useT();
  const a = t.about;

  return (
    <section
      id="about"
      className="relative overflow-hidden pt-12 md:pt-16 pb-20 md:pb-28"
    >
      {/* Top OS menubar */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-4 sm:gap-6 py-2 border-b border-zinc-800/80 font-mono text-[11px] text-zinc-500">
          <span className="text-emerald-400 font-bold tracking-[0.2em]">
            ◆ renan.agent
          </span>
          <span className="hidden sm:inline">file</span>
          <span className="hidden sm:inline">view</span>
          <span className="hidden sm:inline">tools</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor] animate-pulse-soft" />
            agent: {t.header.statusOnline}
          </span>
        </div>
      </div>

      {/* Único efeito de fundo: radial emerald sutil — sem scanlines+grid disputando */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 25% 30%, rgba(52,211,153,0.14), transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mt-8">
        <Reveal>
          <p className="font-mono text-emerald-400 tracking-[0.25em] text-xs">
            {a.eyebrow}
            <span className="text-zinc-600 ml-3 normal-case tracking-wider">
              {a.lastBuild} {new Date().toISOString().slice(0, 10)}
            </span>
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-center">
            {/* Avatar — janela com vinheta CRT, sem wash verde no rosto */}
            <div className="relative w-[180px] sm:w-[200px] shrink-0 self-start lg:self-center">
              <div className="absolute -inset-6 bg-emerald-500/[0.10] rounded-full blur-3xl pointer-events-none" />
              <Window title="operator.feed" className="relative">
                <div className="relative aspect-square overflow-hidden bg-zinc-950">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 110% 110% at 30% 25%, #18181b 0%, #09090b 60%, #050608 100%)",
                    }}
                  />
                  <Image
                    src="/assets/avatar.png"
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                    style={{ filter: "hue-rotate(210deg) saturate(0.85) contrast(1.08) brightness(0.95)" }}
                    alt="Renan Miqueloti"
                    priority
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: "inset 0 0 60px rgba(5,6,8,0.85)" }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
                    style={{
                      background:
                        "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.6) 2px, rgba(0,0,0,0.6) 3px)",
                    }}
                  />
                  <div className="absolute top-1.5 left-2 font-mono text-[8px] tracking-[0.18em] text-emerald-400/80 uppercase pointer-events-none">
                    REC ●
                  </div>
                  <div className="absolute bottom-1.5 right-2 font-mono text-[8px] tracking-wider text-zinc-500 pointer-events-none">
                    320×320
                  </div>
                </div>
                <div className="px-3 py-2 border-t border-zinc-800/80 flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor] animate-pulse-soft" />
                  {a.avatarFooter}
                </div>
              </Window>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl lg:text-[104px] font-semibold leading-[0.92] tracking-[-0.04em] text-zinc-50 [text-shadow:0_0_40px_rgba(52,211,153,0.22)]">
              Renan
              <span className="text-emerald-400">.</span>
              <br />
              <span className="text-zinc-500 font-normal">Miqueloti</span>
            </h1>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-8 max-w-2xl text-xl text-zinc-300 leading-relaxed">
            <span className="text-zinc-50">{a.subtitleStrong}</span>
            {a.subtitleBody}
          </p>
        </Reveal>

        <Reveal delay={140}>
          <p className="mt-4 max-w-2xl text-sm text-zinc-500 italic leading-relaxed border-l-2 border-zinc-800 pl-4">
            {a.bridgeForNonTech}
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-400 text-zinc-950 rounded-md font-mono font-semibold text-sm hover:bg-emerald-300 transition-colors shadow-[0_0_18px_rgba(52,211,153,0.20)]"
            >
              <span>{a.ctaPrimary}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-700 text-zinc-300 rounded-md font-mono text-sm hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
            >
              {a.ctaSecondary}
            </a>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
          <Reveal delay={200}>
            <Window
              title={a.terminalWindowTitle}
              hint={a.terminalHint}
            >
              <AgentTerminal height={420} />
            </Window>
          </Reveal>

          <Reveal delay={260} className="h-full">
            <div className="flex flex-col gap-3 h-full">
              <Window title={a.expWindowTitle}>
                <div className="p-3.5 font-mono text-[12px] leading-[1.7]">
                  {a.experience.map((row, i) => (
                    <div key={row.tag + i} className={i < a.experience.length - 1 ? "mb-2" : ""}>
                      <span className="text-emerald-400">{row.tag}</span>{" "}
                      <span className="text-zinc-300">{row.text}</span>
                    </div>
                  ))}
                </div>
              </Window>

              <Window title={a.whoamiWindowTitle} className="flex-1">
                <div className="p-3.5 font-mono text-[11.5px] leading-[1.85]">
                  {a.whoami.map((row) => (
                    <div key={row.key} className="grid grid-cols-[68px_auto] gap-x-2">
                      <span className="text-zinc-500">{row.key}</span>
                      <span className="text-zinc-300">
                        <span className="text-emerald-400 mr-1.5">:</span>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Window>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default About;
