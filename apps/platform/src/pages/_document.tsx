import { Head, Html, Main, NextScript } from 'next/document';

const TheBoringEducation = () => {
  return (
    <Html lang='en' suppressHydrationWarning>
      <Head />
      <body className='bg-background text-foreground antialiased'>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};
export default TheBoringEducation;
