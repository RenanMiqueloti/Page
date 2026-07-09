import { useEffect } from "react";
import { track } from "./analytics";

// Dispara `section_viewed` uma única vez por seção por pageload, quando a
// seção cruza a faixa central do viewport — mesmo critério do scroll-spy
// (useActiveSection), então "visto" = usuário realmente chegou na seção.
export function useSectionViews(
  ids: string[],
  rootMargin = "-40% 0px -55% 0px"
): void {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const seen = new Set<string>();
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && !seen.has(id)) {
            seen.add(id);
            track("section_viewed", { section: id });
            observer.disconnect();
          }
        },
        { rootMargin, threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids.join(","), rootMargin]);
}
