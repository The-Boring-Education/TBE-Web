// @vitest-environment node
import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";

import {
  assertProdConfirmed,
  loadScriptEnv,
  mustLoadScriptEnv,
  mustParsedValue,
  requireParsedValue,
  resolveScriptEnv,
  SCRIPT_ENV_FILE_MAP,
} from "../../../../api/scripts/lib/script-env";

describe("script-env: resolveScriptEnv", () => {
  it("normalizes aliases to local | dev | prod", () => {
    expect(resolveScriptEnv("local")).toBe("local");
    expect(resolveScriptEnv("dev")).toBe("dev");
    expect(resolveScriptEnv("development")).toBe("dev");
    expect(resolveScriptEnv("prod")).toBe("prod");
    expect(resolveScriptEnv("PROD")).toBe("prod");
    expect(resolveScriptEnv("production")).toBe("prod");
  });

  it("returns null for unknown values", () => {
    expect(resolveScriptEnv("staging")).toBeNull();
  });
});

describe("script-env: env file map", () => {
  it("maps each CLI env to a single file like migrate-content", () => {
    expect(SCRIPT_ENV_FILE_MAP).toEqual({
      local: ".env.local",
      dev: ".env.development",
      prod: ".env.production",
    });
  });
});

describe("script-env: loadScriptEnv", () => {
  const tmpDirs: string[] = [];
  const previousAdminSecret = process.env.ADMIN_SECRET;

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
    if (previousAdminSecret === undefined) {
      delete process.env.ADMIN_SECRET;
    } else {
      process.env.ADMIN_SECRET = previousAdminSecret;
    }
  });

  it("reads values from the single env file, not leftover process.env", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tbe-script-env-"));
    tmpDirs.push(dir);
    fs.writeFileSync(
      path.join(dir, ".env.local"),
      "ADMIN_SECRET=TBEAdmin\nMONGODB_URI=mongodb://localhost:27017/tbe\n",
    );
    process.env.ADMIN_SECRET = "should-not-win";

    const loaded = loadScriptEnv("local", dir);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    expect(requireParsedValue(loaded, "ADMIN_SECRET")).toEqual({
      ok: true,
      value: "TBEAdmin",
    });
    expect(requireParsedValue(loaded, "MISSING_KEY").ok).toBe(false);
    expect(mustParsedValue(loaded, "MONGODB_URI")).toBe(
      "mongodb://localhost:27017/tbe",
    );
    expect(() => mustParsedValue(loaded, "MISSING_KEY")).toThrow(
      /MISSING_KEY not found/,
    );
  });

  it("mustLoadScriptEnv returns the parsed file or throws", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tbe-script-env-"));
    tmpDirs.push(dir);
    fs.writeFileSync(path.join(dir, ".env.local"), "MONGODB_URI=mongodb://x\n");
    expect(mustLoadScriptEnv("local", dir).parsed.MONGODB_URI).toBe(
      "mongodb://x",
    );
    expect(() => mustLoadScriptEnv("prod", dir)).toThrow(/\.env\.production/);
  });

  it("fails when the env file is missing", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tbe-script-env-"));
    tmpDirs.push(dir);
    const loaded = loadScriptEnv("dev", dir);
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.error).toMatch(/\.env\.development/);
  });
});

describe("script-env: assertProdConfirmed", () => {
  it("requires --yes for prod", () => {
    const result = assertProdConfirmed("prod", false);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/--yes/);
  });

  it("allows prod when --yes is set", () => {
    expect(assertProdConfirmed("prod", true).ok).toBe(true);
  });

  it("does not require --yes for non-prod", () => {
    expect(assertProdConfirmed("local", false).ok).toBe(true);
    expect(assertProdConfirmed("dev", false).ok).toBe(true);
  });
});
