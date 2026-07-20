import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const API_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

dotenv.config({ path: path.resolve(API_ROOT, ".env") });

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface TriggerArgs {
  email: string;
  name: string;
}

async function main() {
  const { emailTriggerService } = await import("../src/lib/services/triggers");

  const argv = (await yargs(hideBin(process.argv))
    .option("email", {
      type: "string",
      demandOption: true,
      describe: "Recipient test email address",
    })
    .option("name", {
      type: "string",
      default: "TBE Learner",
      describe: "Recipient name",
    })
    .parse()) as TriggerArgs;

  const email = argv.email;
  const name = argv.name;

  console.log(`Starting onboarding email triggers for ${name} <${email}>...`);
  console.log(`EMAIL_SERVICE_URL: ${process.env.EMAIL_SERVICE_URL}`);

  const apps: Array<
    "platform" | "dsayatra" | "prepyatra" | "oncampus" | "resumeyatra"
  > = ["platform", "dsayatra", "prepyatra", "oncampus", "resumeyatra"];

  for (const app of apps) {
    console.log(`\nTriggering onboarding email for app: ${app}...`);
    try {
      const result = await emailTriggerService.sendExternalEmail({
        emailType: "ONBOARDING",
        userData: {
          email,
          name,
          id: "test-user-id-12345",
        },
        additionalData: {
          app,
          subject: `Test Onboarding: Welcome to ${app}! 🚀`,
        },
      });
      console.log(
        `Result: success=${result.success}, error=${result.error || "none"}`,
      );
    } catch (err: any) {
      console.error(`Failed to trigger for ${app}:`, err.message);
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
