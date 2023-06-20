import { Html, Head, Main, NextScript } from 'next/document'
import { CssBaseline } from '@nextui-org/react'

export default function Document() {
  return (
    <Html lang="en" data-theme="light">
      <Head>
        <link
          href="https://cdn.jsdelivr.net/npm/daisyui@2.50.1/dist/full.css"
          rel="stylesheet"
          type="text/css"
        />
        <script async src="https://cdn.tailwindcss.com"></script>
        {/*<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/lit-node-client-vanilla/lit-node-client.js"></script>*/}
        {/*{CssBaseline.flush()}*/}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
