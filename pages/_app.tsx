import type { AppProps } from "next/app";
import "../styles/globals.css";

import Head from "next/head";
import Script from "next/script";
import { LocaleProvider } from "../lib/useLocale";

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

function MyApp({ Component, pageProps }: AppProps) {
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
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </LocaleProvider>
  );
}

export default MyApp;
