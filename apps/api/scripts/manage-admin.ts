/**
 * Manage admin users directly in MongoDB.
 *
 * Env files (next to `apps/api/package.json`): `.env.local`, `.env.development`,
 * `.env.production` — each must define `MONGODB_URI` and `ADMIN_SECRET`.
 *
 * This script writes to the `adminusers` collection (the source of truth for
 * admin RBAC, checked by `ensureAdminAccess` / `isAdminEmail`). Because it grants
 * privileged access, it is guarded by `ADMIN_SECRET`: the operator must supply the
 * matching value via the `ADMIN_SECRET_CONFIRM` env var (never a CLI flag, to keep
 * it out of shell history). The guard fails closed — it refuses to run if
 * `ADMIN_SECRET` is unset or shorter than 16 characters.
 *
 * From monorepo root:
 *   List:        ADMIN_SECRET_CONFIRM=... pnpm admin:list -- --env prod
 *   Add:         ADMIN_SECRET_CONFIRM=... pnpm admin:add -- --env prod --email a@b.com --yes
 *   Deactivate:  ADMIN_SECRET_CONFIRM=... pnpm admin:deactivate -- --env prod --email a@b.com --yes
 *
 * From `apps/api/`: `pnpm run admin:list -- --env local` (same flags).
 */
import chalk from "chalk";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

/** `apps/api/` — scripts run as ESM (`"type": "module"`), so use import.meta.url not __dirname */
const API_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export type EnvOption = "local" | "development" | "production";

/** Minimum entropy we require before trusting ADMIN_SECRET as a real guard. */
export const MIN_ADMIN_SECRET_LENGTH = 16;

const ENV_FILE_MAP: Record<EnvOption, string> = {
  local: ".env.local",
  development: ".env.development",
  production: ".env.production",
};

/** Normalize `--env` aliases (dev/prod) to a canonical environment. */
export const resolveEnvOption = (value: string): EnvOption | null => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "local") return "local";
  if (normalized === "dev" || normalized === "development")
    return "development";
  if (normalized === "prod" || normalized === "production") return "production";
  return null;
};

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean =>
  EMAIL_REGEX.test(normalizeEmail(email));

/**
 * Constant-time equality for two secrets. Returns false (never throws) when the
 * inputs differ in length, so callers can treat any falsey result as a mismatch.
 */
export const secretsMatch = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
};

export interface GuardResult {
  ok: boolean;
  error?: string;
}

/**
 * Fail-closed guard. Requires ADMIN_SECRET to be present and non-trivial, and
 * requires the operator-supplied confirmation to match it exactly.
 */
export const verifyAdminSecretGuard = (params: {
  adminSecret: string | undefined;
  confirmSecret: string | undefined;
}): GuardResult => {
  const { adminSecret, confirmSecret } = params;

  if (!adminSecret || adminSecret.length < MIN_ADMIN_SECRET_LENGTH) {
    return {
      ok: false,
      error:
        `ADMIN_SECRET is missing or shorter than ${MIN_ADMIN_SECRET_LENGTH} characters for this environment. ` +
        "Refusing to run against a misconfigured environment.",
    };
  }

  if (!confirmSecret) {
    return {
      ok: false,
      error:
        "ADMIN_SECRET_CONFIRM env var is required. Set it to the environment's ADMIN_SECRET value.",
    };
  }

  if (!secretsMatch(confirmSecret, adminSecret)) {
    return {
      ok: false,
      error:
        "ADMIN_SECRET_CONFIRM does not match ADMIN_SECRET for this environment.",
    };
  }

  return { ok: true };
};

/** Production mutations require an explicit `--yes`. */
export const assertProdConfirmed = (
  env: EnvOption,
  yes: boolean,
): GuardResult => {
  if (env === "production" && !yes) {
    return {
      ok: false,
      error:
        "Refusing to mutate production admins without explicit confirmation. Re-run with --yes.",
    };
  }
  return { ok: true };
};

interface AdminUserDoc {
  email: string;
  name?: string;
  notes?: string;
  addedBy?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Minimal schema mirroring apps/api/src/lib/database/models/AdminUser.ts, pinned
 * to the same `adminusers` collection. Defined locally because the real model
 * imports `@/lib/*` path aliases that tsx does not resolve in script context.
 */
const buildAdminUserModel = (conn: mongoose.Connection) => {
  const schema = new mongoose.Schema<AdminUserDoc>(
    {
      email: {
        type: String,
        required: [true, "Admin email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },
      name: {
        type: String,
        trim: true,
        maxlength: [120, "Name cannot exceed 120 characters"],
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500, "Notes cannot exceed 500 characters"],
      },
      addedBy: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    { timestamps: true, collection: "adminusers" },
  );

  return conn.model<AdminUserDoc>("AdminUser", schema);
};

const loadEnv = (env: EnvOption): void => {
  const envPath = path.resolve(API_ROOT, ENV_FILE_MAP[env]);
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(chalk.red(`Failed to load env file: ${envPath}`));
    console.error(chalk.red(result.error.message));
    process.exit(1);
  }
};

/** pnpm/tsx sometimes pass a bare `--` in argv; strip it so yargs parses cleanly. */
const cliArgv = (): string[] => hideBin(process.argv).filter((a) => a !== "--");

type Action = "add" | "list" | "deactivate";

interface CliArgs {
  action: Action;
  env: EnvOption;
  email?: string;
  name?: string;
  notes?: string;
  yes: boolean;
}

const parseArgs = async (): Promise<CliArgs> => {
  const argv = await yargs(cliArgv())
    .command("add", "Add (or re-activate) an admin user")
    .command("list", "List all admin users")
    .command("deactivate", "Deactivate an admin user")
    .demandCommand(1, "Specify one of: add | list | deactivate")
    .option("env", {
      type: "string",
      demandOption: true,
      describe: "Target environment: local | dev | prod",
    })
    .option("email", {
      type: "string",
      describe: "Admin email (add/deactivate)",
    })
    .option("name", { type: "string", describe: "Admin display name (add)" })
    .option("notes", { type: "string", describe: "Notes (add)" })
    .option("yes", {
      type: "boolean",
      default: false,
      describe: "Required to mutate production",
    })
    .strict()
    .parse();

  const action = argv._[0] as Action;
  const env = resolveEnvOption(String(argv.env));
  if (!env) {
    console.error(
      chalk.red(`Invalid --env '${argv.env}'. Use one of: local | dev | prod.`),
    );
    process.exit(1);
  }

  return {
    action,
    env,
    email: argv.email as string | undefined,
    name: argv.name as string | undefined,
    notes: argv.notes as string | undefined,
    yes: Boolean(argv.yes),
  };
};

const runList = async (model: mongoose.Model<AdminUserDoc>): Promise<void> => {
  const admins = await model.find({}).sort({ createdAt: -1 }).lean();
  if (admins.length === 0) {
    console.log(chalk.yellow("No admin users found."));
    return;
  }

  console.log(chalk.yellow(`\n${admins.length} admin user(s):`));
  console.log(chalk.yellow("=".repeat(60)));
  for (const admin of admins) {
    const status = admin.isActive
      ? chalk.green("active")
      : chalk.red("inactive");
    const label = admin.name ? ` (${admin.name})` : "";
    console.log(`  ${status.padEnd(18)} ${admin.email}${label}`);
  }
  console.log("");
};

const runAdd = async (
  model: mongoose.Model<AdminUserDoc>,
  args: CliArgs,
): Promise<void> => {
  if (!args.email || !isValidEmail(args.email)) {
    console.error(chalk.red("A valid --email is required for `add`."));
    process.exit(1);
  }

  const email = normalizeEmail(args.email);
  const existing = await model.findOne({ email });

  if (existing) {
    if (existing.isActive) {
      console.log(chalk.yellow(`Admin ${email} already exists and is active.`));
      return;
    }
    existing.isActive = true;
    if (args.name) existing.name = args.name.trim();
    if (args.notes) existing.notes = args.notes.trim();
    await existing.save();
    console.log(chalk.green(`Re-activated admin ${email}.`));
    return;
  }

  await model.create({
    email,
    name: args.name?.trim() || undefined,
    notes: args.notes?.trim() || undefined,
    addedBy: "manage-admin-script",
    isActive: true,
  });
  console.log(chalk.green(`Added admin ${email}.`));
};

const runDeactivate = async (
  model: mongoose.Model<AdminUserDoc>,
  args: CliArgs,
): Promise<void> => {
  if (!args.email || !isValidEmail(args.email)) {
    console.error(chalk.red("A valid --email is required for `deactivate`."));
    process.exit(1);
  }

  const email = normalizeEmail(args.email);
  const admin = await model.findOne({ email });
  if (!admin) {
    console.error(chalk.red(`No admin found with email ${email}.`));
    process.exit(1);
  }

  if (!admin.isActive) {
    console.log(chalk.yellow(`Admin ${email} is already inactive.`));
    return;
  }

  const activeCount = await model.countDocuments({ isActive: true });
  if (activeCount <= 1) {
    console.error(
      chalk.red(
        "Cannot deactivate the last active admin. Add another admin first.",
      ),
    );
    process.exit(1);
  }

  admin.isActive = false;
  await admin.save();
  console.log(chalk.green(`Deactivated admin ${email}.`));
};

const main = async (): Promise<void> => {
  const args = await parseArgs();

  console.log(
    chalk.yellow(`\nManage admin — action: ${args.action}, env: ${args.env}`),
  );
  console.log(chalk.yellow("=".repeat(60)));

  loadEnv(args.env);

  const secretGuard = verifyAdminSecretGuard({
    adminSecret: process.env.ADMIN_SECRET,
    confirmSecret: process.env.ADMIN_SECRET_CONFIRM,
  });
  if (!secretGuard.ok) {
    console.error(chalk.red(secretGuard.error));
    process.exit(1);
  }

  // `list` is read-only and does not require the prod confirmation flag.
  if (args.action !== "list") {
    const prodGuard = assertProdConfirmed(args.env, args.yes);
    if (!prodGuard.ok) {
      console.error(chalk.red(prodGuard.error));
      process.exit(1);
    }
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(chalk.red("MONGODB_URI not found for this environment."));
    process.exit(1);
  }

  const conn = await mongoose.createConnection(uri).asPromise();
  console.log(chalk.green("Connected to MongoDB\n"));

  try {
    const model = buildAdminUserModel(conn);
    if (args.action === "list") {
      await runList(model);
    } else if (args.action === "add") {
      await runAdd(model, args);
    } else {
      await runDeactivate(model, args);
    }
  } finally {
    await conn.close();
  }
};

/** Only auto-run when invoked directly, so tests can import the pure helpers. */
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(chalk.red("Fatal error:"), error);
    process.exit(1);
  });
}
