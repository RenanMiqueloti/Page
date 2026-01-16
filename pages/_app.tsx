import type { AppProps } from "next/app";
import "../styles/globals.css";

import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "@fontsource/jost/600.css";
import "@fontsource/jost/700.css";
import "@fontsource/sen/400.css";
import "@fontsource/sen/700.css";

import { NextSeo } from "next-seo";
import Head from "next/head";
import Script from "next/script";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />

      <Script id="google-analytics" strategy="lazyOnload">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
                `}
      </Script>
      <NextSeo
        title="Renan Miqueloti - AI Engineer | Desenvolvedor de Agents"
        titleTemplate="Renan Miqueloti - AI Engineer"
        defaultTitle="Renan Miqueloti - AI Engineer | Desenvolvedor de Agents"
        description="AI Engineer especializado no desenvolvimento de agents inteligentes e sistemas autônomos. Desenvolvo soluções utilizando LLMs, LangChain e frameworks modernos de AI."
        openGraph={{
          url: "https://renanmiqueloti.vercel.app/",
          title: "Renan Miqueloti - AI Engineer | Desenvolvedor de Agents",
          description:
            "AI Engineer especializado no desenvolvimento de agents inteligentes. Trabalho com LangChain, LLMs e criação de sistemas autônomos de AI.",
          images: [
            {
              url: "https://renanmiqueloti.vercel.app/assests/avatar.png",
              width: 1200,
              height: 630,
              alt: "Renan Miqueloti - AI Engineer e Desenvolvedor de Agents",
            },
          ],
        }}
       
        additionalMetaTags={[
          {
            property: "keywords",
            content:
              "AI Engineer, Agent Developer, LangChain, LLM, Agents, Artificial Intelligence, Machine Learning, Data Science, Python, TensorFlow, Renan Miqueloti, desenvolvimento de agents, agentic AI, OpenAI, Claude, RAG, Prompt Engineering",
          },
        ]}
      />
      <Head>
        <link rel="icon" type="image/png" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
