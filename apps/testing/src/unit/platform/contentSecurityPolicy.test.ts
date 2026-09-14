/**
 * @vitest-environment node
 */
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

describe("Platform Content Security Policy & Security Headers", () => {
  const getNextConfigHeaders = async (nodeEnv: string) => {
    const configPath = path.resolve(
      __dirname,
      "../../../../platform/next.config.js",
    );
    const fileContent = fs.readFileSync(configPath, "utf-8");

    // Extract nextConfig object or evaluate it in a controlled context
    const fn = new Function(
      "process",
      "require",
      `
      const isDev = "${nodeEnv}" !== 'production';
      ${fileContent
        .replace(
          /const\s+\{\s*withSentryConfig\s*\}\s*=\s*require\('@sentry\/nextjs'\);/g,
          "const withSentryConfig = (c) => c;",
        )
        .replace(/module\.exports\s*=\s*.+;/g, "")}
      return nextConfig;
      `,
    );

    const nextConfig = fn(
      { ...process, env: { ...process.env, NODE_ENV: nodeEnv } },
      require,
    );

    return nextConfig.headers();
  };

  const parseCspDirectives = (
    cspHeaderValue: string,
  ): Map<string, string[]> => {
    const directives = new Map<string, string[]>();
    const tokens = cspHeaderValue
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);

    for (const token of tokens) {
      const parts = token.split(/\s+/);
      const directiveName = parts[0];
      const directiveValues = parts.slice(1);
      directives.set(directiveName, directiveValues);
    }

    return directives;
  };

  it("should define all mandatory security headers on all routes", async () => {
    const headerConfigs = await getNextConfigHeaders("production");
    expect(Array.isArray(headerConfigs)).toBe(true);

    const rootConfig = headerConfigs.find(
      (entry: any) => entry.source === "/(.*)",
    );
    expect(rootConfig).toBeDefined();

    const headersMap = new Map<string, string>();
    for (const h of rootConfig.headers) {
      headersMap.set(h.key, h.value);
    }

    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-XSS-Protection")).toBe("0");
    expect(headersMap.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headersMap.get("Strict-Transport-Security")).toContain("max-age=");
    expect(headersMap.get("Permissions-Policy")).toBeDefined();
    expect(headersMap.get("Content-Security-Policy")).toBeDefined();
  });

  it("should configure worker-src with 'self' and blob: to prevent web worker CSP violation", async () => {
    const headerConfigs = await getNextConfigHeaders("production");
    const rootConfig = headerConfigs.find(
      (entry: any) => entry.source === "/(.*)",
    );
    const cspValue = rootConfig.headers.find(
      (h: any) => h.key === "Content-Security-Policy",
    )?.value;

    expect(cspValue).toBeDefined();
    const directives = parseCspDirectives(cspValue);

    expect(directives.has("worker-src")).toBe(true);
    const workerSrcValues = directives.get("worker-src") || [];

    expect(workerSrcValues).toContain("'self'");
    expect(workerSrcValues).toContain("blob:");
  });

  it("should allow Google Analytics 4 (/g/collect) and Cashfree endpoints in connect-src", async () => {
    const headerConfigs = await getNextConfigHeaders("production");
    const rootConfig = headerConfigs.find(
      (entry: any) => entry.source === "/(.*)",
    );
    const cspValue = rootConfig.headers.find(
      (h: any) => h.key === "Content-Security-Policy",
    )?.value;

    const directives = parseCspDirectives(cspValue);
    expect(directives.has("connect-src")).toBe(true);
    const connectSrcValues = directives.get("connect-src") || [];

    // Core domains
    expect(connectSrcValues).toContain("'self'");
    expect(connectSrcValues).toContain("https://*.theboringeducation.com");
    expect(connectSrcValues).toContain("https://*.sentry.io");

    // Google Analytics 4 endpoints
    expect(connectSrcValues).toContain("https://www.google-analytics.com");
    expect(connectSrcValues).toContain("https://analytics.google.com");
    expect(connectSrcValues).toContain("https://*.google-analytics.com");
    expect(connectSrcValues).toContain("https://*.google.com");

    // Cashfree SDK & Gateway endpoints
    expect(connectSrcValues).toContain("https://sdk.cashfree.com");
    expect(connectSrcValues).toContain("https://*.cashfree.com");
  });

  it("should allow required script-src domains and handle dev unsafe-eval conditionally", async () => {
    // Production mode
    const prodHeaders = await getNextConfigHeaders("production");
    const prodCsp = prodHeaders
      .find((e: any) => e.source === "/(.*)")
      ?.headers.find((h: any) => h.key === "Content-Security-Policy")?.value;
    const prodDirectives = parseCspDirectives(prodCsp);
    const prodScriptSrc = prodDirectives.get("script-src") || [];

    expect(prodScriptSrc).toContain("'self'");
    expect(prodScriptSrc).toContain("'unsafe-inline'");
    expect(prodScriptSrc).toContain("https://www.googletagmanager.com");
    expect(prodScriptSrc).toContain("https://www.google-analytics.com");
    expect(prodScriptSrc).toContain("https://sdk.cashfree.com");
    expect(prodScriptSrc).not.toContain("'unsafe-eval'");

    // Development mode
    const devHeaders = await getNextConfigHeaders("development");
    const devCsp = devHeaders
      .find((e: any) => e.source === "/(.*)")
      ?.headers.find((h: any) => h.key === "Content-Security-Policy")?.value;
    const devDirectives = parseCspDirectives(devCsp);
    const devScriptSrc = devDirectives.get("script-src") || [];

    expect(devScriptSrc).toContain("'unsafe-eval'");
  });

  it("should allow payment gateway and media domains in frame-src", async () => {
    const headerConfigs = await getNextConfigHeaders("production");
    const rootConfig = headerConfigs.find(
      (entry: any) => entry.source === "/(.*)",
    );
    const cspValue = rootConfig.headers.find(
      (h: any) => h.key === "Content-Security-Policy",
    )?.value;

    const directives = parseCspDirectives(cspValue);
    expect(directives.has("frame-src")).toBe(true);
    const frameSrcValues = directives.get("frame-src") || [];

    expect(frameSrcValues).toContain("'self'");
    expect(frameSrcValues).toContain("https://www.youtube.com");
    expect(frameSrcValues).toContain("https://sdk.cashfree.com");
    expect(frameSrcValues).toContain("https://*.cashfree.com");
  });

  it("should allow payment gateway endpoints in form-action to permit checkout form submissions", async () => {
    const headerConfigs = await getNextConfigHeaders("production");
    const rootConfig = headerConfigs.find(
      (entry: any) => entry.source === "/(.*)",
    );
    const cspValue = rootConfig.headers.find(
      (h: any) => h.key === "Content-Security-Policy",
    )?.value;

    const directives = parseCspDirectives(cspValue);
    expect(directives.has("form-action")).toBe(true);
    const formActionValues = directives.get("form-action") || [];

    expect(formActionValues).toContain("'self'");
    expect(formActionValues).toContain("https://*.cashfree.com");
    expect(formActionValues).toContain("https://sandbox.cashfree.com");
    expect(formActionValues).toContain("https://api.cashfree.com");
  });
});
