import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    const locale = this.props.__NEXT_DATA__?.locale || "pt-BR";
    return (
      <Html lang={locale}>
        <Head>
          <meta name="theme-color" content="#09090b" />
          <meta
            name="robots"
            content="index, follow, max-image-preview:large, max-snippet:-1"
          />
          <meta name="format-detection" content="telephone=no" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
