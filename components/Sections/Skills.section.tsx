import { Reveal } from "../Misc/Reveal.component";
import { useT } from "../../lib/useLocale";

const Skills = () => {
  const t = useT();
  const s = t.skills;

  return (
    <section id="skills" className="relative py-24 md:py-32 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <Reveal>
          <p className="font-mono text-emerald-400 tracking-[0.25em] text-xs">{s.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-50 leading-[1]">
            {s.title}
          </h2>
          <p className="mt-5 max-w-xl text-zinc-400 leading-relaxed">{s.intro}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 rounded-lg overflow-hidden">
          {s.categories.map((cat, i) => (
            <Reveal key={cat.title} delay={i * 60}>
              <div className="h-full p-7 md:p-8 bg-zinc-950 hover:bg-zinc-900/40 transition-colors">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-mono text-[11px] text-emerald-400 tracking-[0.2em]">
                    NODE_{cat.eyebrow}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-600">
                    {cat.file}
                  </span>
                </div>
                <h3 className="font-display text-2xl text-zinc-50 tracking-tight mb-5">
                  {cat.title}
                </h3>
                <ul className="flex flex-wrap gap-2.5">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="px-3 py-1.5 text-sm text-zinc-400 border border-zinc-800 rounded-md font-mono hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-8 flex justify-center">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 font-mono text-sm text-zinc-500 hover:text-emerald-300 transition-colors"
            >
              <span>$ trabalhando em algo assim?</span>
              <span className="text-emerald-400">vamos conversar</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Skills;
