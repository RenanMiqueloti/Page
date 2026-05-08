import { AiOutlineGithub } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { Reveal } from "../Misc/Reveal.component";
import { useT } from "../../lib/useLocale";

const SOCIALS = [
  {
    label: "LinkedIn",
    Icon: FaLinkedinIn,
    href: "https://www.linkedin.com/in/renanmiqueloti",
  },
  {
    label: "GitHub",
    Icon: AiOutlineGithub,
    href: "https://github.com/RenanMiqueloti",
  },
];

const EMAIL = "renanmiqueloti@gmail.com";

const Contact = () => {
  const t = useT();
  const c = t.contact;

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 border-t border-zinc-900 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(52,211,153,0.08), transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <Reveal>
          <p className="font-mono text-emerald-400 tracking-[0.25em] text-xs">
            {c.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-zinc-50 leading-[1.02] tracking-tight">
            {c.headline}
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {c.body}
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center gap-3 px-7 py-3.5 bg-emerald-400 text-zinc-950 rounded-md font-mono font-semibold tracking-wide text-sm hover:bg-emerald-300 transition-all shadow-[0_0_18px_rgba(52,211,153,0.20)]"
            >
              <span>{c.ctaEmail}</span>
              <span className="text-zinc-700">·</span>
              <span>{EMAIL}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={280}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-4 py-2.5 text-zinc-400 border border-zinc-800 rounded-md font-mono text-sm hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
              >
                <s.Icon size={16} />
                <span>{s.label}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Contact;
