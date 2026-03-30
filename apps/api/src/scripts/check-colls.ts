import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env.local") });

async function check() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db();
  const colls = await db.listCollections().toArray();
  console.log(
    "Collections:",
    colls.map((c) => c.name),
  );
  await client.close();
}

check();
