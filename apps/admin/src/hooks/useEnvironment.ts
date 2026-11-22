export type AdminEnv = "local" | "dev" | "prod";

const configuredEnv = import.meta.env.VITE_ADMIN_ENV;
export const ADMIN_ENV: AdminEnv =
  configuredEnv === "dev" || configuredEnv === "prod" ? configuredEnv : "local";

export const ENV_BASE_URL_MAP: Record<AdminEnv, string> = {
  local:
    (import.meta.env.VITE_BASE_API_URL as string) ||
    "http://localhost:3004/api/v1",
  dev: "https://tbe-dev-git-development-tbe.vercel.app/api/v1",
  prod:
    (import.meta.env.VITE_PROD_API_URL as string) ||
    "https://api.theboringeducation.com/api/v1",
};

// Agents API base URLs for each environment
export const ENV_AGENTS_API_BASE_MAP: Record<AdminEnv, string> = {
  local: "http://localhost:8000/api/v1",
  dev: "https://tbe-agents-dev.vercel.app/api/v1", // Update with your actual dev Agents URL
  prod: "https://tbe-agents-prod.vercel.app/api/v1", // Update with your actual prod Agents URL
};

export function getAdminEnvironment(): AdminEnv {
  return ADMIN_ENV;
}

export function getPlatformApiBaseUrl(): string {
  return ENV_BASE_URL_MAP[ADMIN_ENV];
}

export function getAgentsApiBaseUrl(): string {
  return ENV_AGENTS_API_BASE_MAP[ADMIN_ENV];
}
