import { Head, Html, Main, NextScript } from 'next/document';

const TheBoringEducation = () => {
  return (
    <Html lang='en'>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'system';var isDark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(isDark){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};
export default TheBoringEducation;
