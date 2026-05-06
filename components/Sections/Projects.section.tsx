import { Reveal } from "../Misc/Reveal.component";
import { Window } from "../Misc/Window.component";
import { useT } from "../../lib/useLocale";

const Projects = () => {
  const t = useT();
  const p = t.projects;
  const featured = p.featured;

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

        <div className="mt-12">
          <Reveal>
            <Window title="selected-work/">
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block p-8 md:p-10 hover:bg-zinc-900/30 transition-colors"
              >
                <div className="relative">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-300/90">
                    {featured.label}
                  </span>
                  <h3 className="mt-5 font-display text-3xl md:text-4xl text-zinc-50 tracking-tight mb-4 group-hover:text-emerald-300 transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-zinc-400 max-w-2xl leading-relaxed text-[15px]">
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
                </div>
              </a>

              <div className="border-t border-zinc-800/60 grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800/60">
                {p.secondary.map((proj, i) => {
                  const isWip = proj.label === p.comingSoonLabel;
                  const isUnavailable = proj.label === p.unavailableLabel;
                  const isDisabled = isWip || isUnavailable;
                  return (
                    <Reveal key={proj.title} delay={(i + 1) * 80} className="h-full">
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group block h-full p-6 transition-colors ${
                          isDisabled
                            ? "opacity-45 cursor-not-allowed pointer-events-none grayscale-[40%] bg-zinc-950/85"
                            : "bg-zinc-950/85 hover:bg-zinc-900/40"
                        }`}
                      >
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-[0.2em] border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 mb-4">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_currentColor] animate-pulse" />
                          {proj.label}
                        </div>
                        <h3 className="font-display text-xl text-zinc-50 tracking-tight group-hover:text-emerald-300 transition-colors">
                          {proj.title}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                          {proj.description}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {proj.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-[11px] font-mono text-zinc-500 border border-zinc-800 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-5 font-mono text-emerald-300 text-xs inline-flex items-center gap-1">
                          <span>$ {proj.cta.toLowerCase()}</span>
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                      </a>
                    </Reveal>
                  );
                })}
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
