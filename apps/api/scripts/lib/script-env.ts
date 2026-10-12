/**
 * Shared env + CLI helpers for `apps/api/scripts/*`.
 *
 * Same contract as migrate-content:
 *   local → `.env.local`
 *   dev   → `.env.development`
 *   prod  → `.env.production`
 *
 * One file per environment. Values are taken from that file (`parsed`), not
 * from leftover `process.env` after a stack of dotenv overlays.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { hideBin } from "yargs/helpers";

export type ScriptEnv = "local" | "dev" | "prod";

export const SCRIPT_ENV_CHOICES = ["local", "dev", "prod"] as const;

export const SCRIPT_ENV_FILE_MAP: Record<ScriptEnv, string> = {
  local: ".env.local",
  dev: ".env.development",
  prod: ".env.production",
};

/** `apps/api/` — scripts run as ESM (`"type": "module"`). */
export const API_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export interface GuardResult {
  ok: boolean;
  error?: string;
}

export interface LoadedScriptEnv {
  env: ScriptEnv;
  envPath: string;
  parsed: Record<string, string>;
}

export type LoadScriptEnvResult =
  ({ ok: true } & LoadedScriptEnv) | { ok: false; error: string };

/** pnpm/tsx sometimes pass a bare `--` in argv; yargs then misses flags. */
export const cliArgv = (): string[] =>
  hideBin(process.argv).filter((a) => a !== "--");

export const resolveScriptEnv = (value: string): ScriptEnv | null => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "local") return "local";
  if (normalized === "dev" || normalized === "development") return "dev";
  if (normalized === "prod" || normalized === "production") return "prod";
  return null;
};

export const scriptEnvFileName = (env: ScriptEnv): string =>
  SCRIPT_ENV_FILE_MAP[env];

export const loadEnvFile = (envPath: string): LoadScriptEnvResult => {
  const result = dotenv.config({ path: envPath, override: true });
  if (result.error) {
    return {
      ok: false,
      error: `Failed to load env file: ${envPath}\n${result.error.message}`,
    };
  }
  return {
    ok: true,
    env: "local",
    envPath,
    parsed: result.parsed ?? {},
  };
};

export const loadScriptEnv = (
  env: ScriptEnv,
  apiRoot: string = API_ROOT,
): LoadScriptEnvResult => {
  const envPath = path.resolve(apiRoot, SCRIPT_ENV_FILE_MAP[env]);
  const loaded = loadEnvFile(envPath);
  if (!loaded.ok) {
    return loaded;
  }
  return { ...loaded, env };
};

export const requireParsedValue = (
  loaded: LoadedScriptEnv,
  key: string,
): { ok: true; value: string } | { ok: false; error: string } => {
  const value = loaded.parsed[key]?.trim();
  if (!value) {
    return {
      ok: false,
      error: `${key} not found in ${loaded.envPath}`,
    };
  }
  return { ok: true, value };
};

/** Same as `requireParsedValue`, but throws so callers get a `string`. */
export const mustParsedValue = (
  loaded: LoadedScriptEnv,
  key: string,
): string => {
  const result = requireParsedValue(loaded, key);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.value;
};

/** Same as `loadScriptEnv`, but throws so callers get `LoadedScriptEnv`. */
export const mustLoadScriptEnv = (
  env: ScriptEnv,
  apiRoot: string = API_ROOT,
): LoadedScriptEnv => {
  const loaded = loadScriptEnv(env, apiRoot);
  if (!loaded.ok) {
    throw new Error(loaded.error);
  }
  return loaded;
};

/** Production mutations require an explicit confirmation flag (`--yes`). */
export const assertProdConfirmed = (
  env: ScriptEnv,
  yes: boolean,
): GuardResult => {
  if (env === "prod" && !yes) {
    return {
      ok: false,
      error:
        "Refusing to write to production without explicit confirmation. Re-run with --yes.",
    };
  }
  return { ok: true };
};
