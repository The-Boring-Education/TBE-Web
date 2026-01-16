import { GTMNoScript, GTMScript } from '@tbe/components'
import { Head, Html, Main, NextScript } from 'next/document'

const TheBoringEducation = () => {
  return (
    <Html lang='en'>
      <Head>
        <GTMScript />
      </Head>
      <body>
        <GTMNoScript />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
export default TheBoringEducation
