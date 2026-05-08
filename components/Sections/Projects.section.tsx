import { useState } from "react";
import { Reveal } from "../Misc/Reveal.component";
import { Window } from "../Misc/Window.component";
import { useT } from "../../lib/useLocale";

const PER_PAGE = 2;

const Projects = () => {
  const t = useT();
  const p = t.projects;
  const featured = p.featured;
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(p.secondary.length / PER_PAGE);
  const visible = p.secondary.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <section id="projects" className="relative py-24 md:py-32 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <Reveal>
          <p className="font-mono text-emerald-400 tracking-[0.25em] text-xs">
            {p.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-50 leading-[1]">
            {p.title}
          </h2>
          <p className="mt-5 max-w-xl text-zinc-400 leading-relaxed">{p.intro}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Featured — left */}
          <Reveal>
            <Window title="selected-work/" className="h-full">
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full p-7 hover:bg-zinc-900/30 transition-colors"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-300/90">
                  {featured.label}
                </span>
                <h3 className="mt-5 font-display text-3xl md:text-4xl text-zinc-50 tracking-tight mb-4 group-hover:text-emerald-300 transition-colors">
                  {featured.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-[15px] line-clamp-4">
                  {featured.description}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {featured.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs font-mono text-zinc-400 border border-zinc-800 rounded-md group-hover:border-emerald-500/40 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-8 inline-flex items-center gap-2 text-sm text-emerald-300 font-mono">
                  <span>$ {featured.cta.toLowerCase()}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </a>
            </Window>
          </Reveal>

          {/* Carousel — right */}
          <Reveal delay={120}>
            <Window
              title="$ ls projects/"
              hint={`${String(page + 1).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`}
              className="h-full flex flex-col"
            >
              <div className="flex-1 min-h-0 grid grid-cols-2 gap-px bg-zinc-800/60">
                {visible.map((proj) => {
                  const isWip = proj.label === p.comingSoonLabel;
                  const isUnavailable = proj.label === p.unavailableLabel;
                  const isDisabled = isWip || isUnavailable;
                  return (
                    <a
                      key={proj.title}
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group block p-5 transition-colors ${
                        isDisabled
                          ? "opacity-45 cursor-not-allowed pointer-events-none grayscale-[40%] bg-zinc-950/85"
                          : "bg-zinc-950/85 hover:bg-zinc-900/40"
                      }`}
                    >
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-[0.2em] border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 mb-3">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_currentColor] animate-pulse" />
                        {proj.label}
                      </div>
                      <h3 className="font-display text-lg text-zinc-50 tracking-tight group-hover:text-emerald-300 transition-colors leading-tight">
                        {proj.title}
                      </h3>
                      <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-4">
                        {proj.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-mono text-zinc-500 border border-zinc-800 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 font-mono text-emerald-300 text-xs inline-flex items-center gap-1">
                        <span>$ {proj.cta.toLowerCase()}</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/60 font-mono text-xs select-none">
                <button
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className="text-zinc-500 hover:text-emerald-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  ← prev
                </button>
                <span className="text-zinc-600 tracking-widest">
                  {String(page + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(totalPages).padStart(2, "0")}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page === totalPages - 1}
                  className="text-zinc-500 hover:text-emerald-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  next →
                </button>
              </div>
            </Window>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-10 flex justify-center">
            <a
              href={p.seeAllUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-800 text-zinc-400 rounded-md font-mono text-sm hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
            >
              <span>{p.seeAllCta}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Projects;
