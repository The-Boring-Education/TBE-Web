import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set!");
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const subject = await db
    .collection("coresubjects")
    .findOne({ subjectId: "oops" });
  if (subject) {
    const ch = subject.chapters.find(
      (c: any) => c.title === "Classes & Objects",
    );
    if (ch) {
      console.log(
        "CHAPTER 1 (Classes & Objects):",
        JSON.stringify(ch, null, 2),
      );
    } else {
      console.log("Chapter not found!");
    }
  }
  await client.close();
}

check();
