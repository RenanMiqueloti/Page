// components/Navigation/Header.nav.tsx
// OS menubar global — sempre visível, scroll-spy, status online, toggle PT/EN.

import { useEffect, useState } from "react";
import { useActiveSection } from "../../lib/useActiveSection";
import { useLocale } from "../../lib/useLocale";
import { track } from "../../lib/analytics";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState<string>("");
  const { t, toggle, locale } = useLocale();
  const links = t.header.nav;
  const active = useActiveSection(links.map((l) => l.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const update = () =>
      setTime(new Date().toTimeString().slice(0, 5));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${scrolled ? "bg-zinc-950/85 border-b border-zinc-800/80 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]" : "bg-zinc-950/55 border-b border-zinc-800/40"}`}
    >
      {/* sutil glow emerald no topo */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-10">
        {/* Brand */}
        <a
          href="#about"
          className="group flex items-center gap-2 sm:gap-3 font-mono text-[11px] tracking-wider shrink-0"
        >
          <span className="text-emerald-400 text-base leading-none drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]">
            ◆
          </span>
          <span className="text-zinc-100 font-bold uppercase tracking-[0.18em] group-hover:text-emerald-300 transition-colors">
            renan.agent
          </span>
          <span className="hidden sm:inline text-zinc-700">·</span>
          <span className="hidden sm:inline text-zinc-500 lowercase">
            ~/portfolio
          </span>
        </a>

        {/* Nav */}
        <nav
          aria-label={locale === "en" ? "Primary" : "Primária"}
          className="hidden md:flex items-center gap-0.5"
        >
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={() => track("nav_click", { section: l.id })}
                aria-current={isActive ? "true" : undefined}
                className={`relative font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-1 transition-colors ${isActive ? "text-emerald-300" : "text-zinc-500 hover:text-zinc-200"}`}
              >
                <span
                  aria-hidden
                  className={
                    "absolute left-0.5 top-1/2 -translate-y-1/2 text-emerald-400 transition-opacity " +
                    (isActive ? "opacity-100" : "opacity-0")
                  }
                >
                  ⌜
                </span>
                {l.label}
                <span
                  aria-hidden
                  className={
                    "absolute right-0.5 top-1/2 -translate-y-1/2 text-emerald-400 transition-opacity " +
                    (isActive ? "opacity-100" : "opacity-0")
                  }
                >
                  ⌟
                </span>
              </a>
            );
          })}
        </nav>

        {/* Status + locale */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px] text-zinc-500 shrink-0">
          <button
            type="button"
            onClick={() => {
              track("locale_toggle", {
                from: locale,
                to: locale === "pt" ? "en" : "pt",
              });
              toggle();
            }}
            aria-label={`Switch language to ${t.header.localeToggleLabel}`}
            className="px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors text-[10px] tracking-[0.2em] uppercase"
          >
            {locale.toUpperCase()}
            <span className="text-zinc-700 mx-1">/</span>
            <span className="text-zinc-600">
              {t.header.localeToggleLabel}
            </span>
          </button>
          <span className="hidden sm:inline tabular-nums text-zinc-600">
            {time || "--:--"}
          </span>
          <span className="hidden sm:inline text-zinc-700">·</span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_6px_currentColor]" />
            </span>
            <span className="text-zinc-300">{t.header.statusOnline}</span>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
