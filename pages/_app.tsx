import type { AppProps } from "next/app";
import "../styles/globals.css";

import { useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { LocaleProvider } from "../lib/useLocale";
import {
  initAnalytics,
  setLocaleProperty,
  trackPageview,
} from "../lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    setLocaleProperty(router.locale ?? "pt-BR");
  }, [router.locale]);

  useEffect(() => {
    trackPageview();
    const onRouteChange = () => trackPageview();
    router.events.on("routeChangeComplete", onRouteChange);
    return () => router.events.off("routeChangeComplete", onRouteChange);
  }, [router.events]);

  return (
    <LocaleProvider>
      {GA_ID && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script id="google-analytics" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
      {CLARITY_ID && (
        <Script id="ms-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </LocaleProvider>
  );
}

export default MyApp;
