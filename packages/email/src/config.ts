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
  const url =
    (typeof process !== "undefined" && process.env?.CHITTHI_URL) ||
    (typeof process !== "undefined" && process.env?.EMAIL_SERVICE_URL) ||
    "";

  const apiKey =
    (typeof process !== "undefined" && process.env?.CHITTHI_API_KEY) ||
    (typeof process !== "undefined" && process.env?.EMAIL_API_KEY) ||
    "";

  const fromEmail =
    (typeof process !== "undefined" && process.env?.CHITTHI_FROM_EMAIL) ||
    (typeof process !== "undefined" && process.env?.FROM_EMAIL) ||
    "theboringeducation@gmail.com";

  const fromName =
    (typeof process !== "undefined" && process.env?.CHITTHI_FROM_NAME) || "TBE";

  return { url, apiKey, fromEmail, fromName };
};
