// lib/analytics.ts
// Módulo único de analytics (PostHog). Env-gated como o GA em _app.tsx:
// sem NEXT_PUBLIC_POSTHOG_KEY tudo vira no-op — dev/preview funcionam sem env.

import posthog from "posthog-js";

let initialized = false;

export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    // Pageviews capturados manualmente (trackPageview) — o toggle PT/EN é uma
    // navegação SPA que o pageview automático não cobre no pages router.
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    respect_dnt: true,
  });
  initialized = true;
}

export function track(
  event: string,
  props?: Record<string, unknown>
): void {
  if (!initialized) return;
  posthog.capture(event, props);
}

export function trackPageview(): void {
  track("$pageview");
}

// Super property: todo evento subsequente carrega o idioma da sessão.
export function setLocaleProperty(locale: string): void {
  if (!initialized) return;
  posthog.register({ locale });
}
