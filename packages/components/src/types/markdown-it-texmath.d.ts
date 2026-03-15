declare module "markdown-it-texmath" {
  import type MarkdownIt from "markdown-it";

  interface TexMathOptions {
    engine?: { renderToString: (tex: string, options?: object) => string };
    delimiters?: string | string[];
    katexOptions?: {
      throwOnError?: boolean;
      macros?: Record<string, string>;
      [key: string]: unknown;
    };
    outerSpace?: boolean;
    macros?: Record<string, string>;
  }

  function texmath(md: MarkdownIt, options?: TexMathOptions): void;

  export = texmath;
}
