import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useRouter } from "next/router";
import {
  DEFAULT_LOCALE,
  Locale,
  MESSAGES,
  Messages,
} from "./i18n";

// Mapeamento entre o locale do Next router (pt-BR | en) e o Locale interno (pt | en).
const routerToInternal = (l: string | undefined): Locale => {
  if (!l) return DEFAULT_LOCALE;
  if (l === "en") return "en";
  return "pt"; // pt-BR ou qualquer outro vira pt
};

const internalToRouter = (l: Locale): string => (l === "en" ? "en" : "pt-BR");

const persistLocaleCookie = (routerLocale: string) => {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `NEXT_LOCALE=${routerLocale}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: Messages;
};

const LocaleContext = createContext<Ctx | null>(null);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const locale = routerToInternal(router.locale);

  const setLocale = useCallback(
    (l: Locale) => {
      const target = internalToRouter(l);
      persistLocaleCookie(target);
      router.push(router.asPath, router.asPath, { locale: target });
    },
    [router]
  );

  const toggle = useCallback(() => {
    const next: Locale = locale === "pt" ? "en" : "pt";
    const target = internalToRouter(next);
    persistLocaleCookie(target);
    router.push(router.asPath, router.asPath, { locale: target });
  }, [locale, router]);

  const value = useMemo<Ctx>(
    () => ({ locale, setLocale, toggle, t: MESSAGES[locale] }),
    [locale, setLocale, toggle]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

export const useLocale = (): Ctx => {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      toggle: () => {},
      t: MESSAGES[DEFAULT_LOCALE],
    };
  }
  return ctx;
};

export const useT = (): Messages => useLocale().t;
