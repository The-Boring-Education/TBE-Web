const readEnv = (name: string): string | undefined =>
  typeof process !== "undefined" ? process.env?.[name] : undefined;

/**
 * Chitthi (email service) configuration.
 *
 * Configured via environment variables:
 *   CHITTHI_URL         - Base URL of the Chitthi email service
 *   CHITTHI_API_KEY     - API key used to authenticate with Chitthi
 *   CHITTHI_FROM_EMAIL  - Default sender email
 *
 * Legacy env vars (`EMAIL_SERVICE_URL`, `EMAIL_API_KEY`, `FROM_EMAIL`) are
 * accepted as fallbacks so existing deployments keep working.
 */
export const getChitthiConfig = () => {
  const url = readEnv("CHITTHI_URL") || readEnv("EMAIL_SERVICE_URL") || "";
  const apiKey = readEnv("CHITTHI_API_KEY") || readEnv("EMAIL_API_KEY") || "";
  const fromEmail =
    readEnv("CHITTHI_FROM_EMAIL") ||
    readEnv("FROM_EMAIL") ||
    "theboringeducation@gmail.com";
  const fromName = readEnv("CHITTHI_FROM_NAME") || "TBE";

  return { url, apiKey, fromEmail, fromName };
};
