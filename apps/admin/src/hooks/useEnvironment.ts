export type AdminEnv = "local" | "dev" | "prod";

// Legacy single-key (kept for backward compatibility in some spots)
export const ENV_STORAGE_KEY = "tbe-admin-api-env";

// Separate storage keys
export const ENV_STORAGE_KEY_PLATFORM = "tbe-admin-platform-env";
export const ENV_STORAGE_KEY_AGENTS = "tbe-admin-agents-env";

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

// Backward-compatible single env getters (defaults to platform env)
export function getStoredEnv(): AdminEnv {
  const val = (
    localStorage.getItem(ENV_STORAGE_KEY_PLATFORM) ||
    localStorage.getItem(ENV_STORAGE_KEY) ||
    ""
  ).toLowerCase();
  if (val === "dev" || val === "prod" || val === "local") return val;
  return "local";
}

export function setStoredEnv(env: AdminEnv) {
  localStorage.setItem(ENV_STORAGE_KEY_PLATFORM, env);
  localStorage.setItem(ENV_STORAGE_KEY, env);
}

// Platform env helpers
export function getStoredPlatformEnv(): AdminEnv {
  const val = (
    localStorage.getItem(ENV_STORAGE_KEY_PLATFORM) || ""
  ).toLowerCase();
  if (val === "dev" || val === "prod" || val === "local") return val;
  return "local";
}

export function setStoredPlatformEnv(env: AdminEnv) {
  localStorage.setItem(ENV_STORAGE_KEY_PLATFORM, env);
}

export function getBaseUrlForPlatformEnv(env?: AdminEnv): string {
  const current = env || getStoredPlatformEnv();
  return ENV_BASE_URL_MAP[current];
}

export function useEnvironment(): [AdminEnv, (env: AdminEnv) => void] {
  const initial =
    typeof window !== "undefined"
      ? getStoredPlatformEnv()
      : ("local" as AdminEnv);
  const [env] = ((): [AdminEnv, (env: AdminEnv) => void] => {
    // lightweight state without importing React to keep tree small
    return [initial, (e: AdminEnv) => setStoredPlatformEnv(e)];
  })();
  return [
    env,
    (e) => {
      setStoredPlatformEnv(e);
      // notify by dispatching an event so listeners can update if needed
      window.dispatchEvent(
        new CustomEvent("tbe-admin-env-change", { detail: { env: e } }),
      );
    },
  ];
}

export function getEnvBannerClasses(env: AdminEnv): string {
  switch (env) {
    case "prod":
      return "bg-rose-50 border-rose-200 text-rose-800";
    case "dev":
      return "bg-amber-50 border-amber-200 text-amber-800";
    default:
      return "bg-sky-50 border-sky-200 text-sky-800";
  }
}

// Agents API environment helpers
export const AGENTS_ENV_STORAGE_KEY = "tbe-admin-agents-env";

export const AGENTS_ENV_BASE_URL_MAP: Record<AdminEnv, string> = {
  local:
    (import.meta.env.VITE_AGENTS_API_BASE as string) ||
    "http://localhost:8000/api/v1",
  dev: "https://tbe-agents-dev.vercel.app/api/v1",
  prod: "https://tbe-agents-prod.vercel.app/api/v1",
};

export function getStoredAgentsEnv(): AdminEnv {
  const val = (
    localStorage.getItem(AGENTS_ENV_STORAGE_KEY) || ""
  ).toLowerCase();
  if (val === "dev" || val === "prod" || val === "local")
    return val as AdminEnv;
  return "local";
}

export function setStoredAgentsEnv(env: AdminEnv) {
  localStorage.setItem(AGENTS_ENV_STORAGE_KEY, env);
  window.dispatchEvent(
    new CustomEvent("tbe-admin-agents-env-change", { detail: { env } }),
  );
}

export function getAgentsApiBaseForEnv(env?: AdminEnv): string {
  const current = env || getStoredAgentsEnv();
  return AGENTS_ENV_BASE_URL_MAP[current];
}
