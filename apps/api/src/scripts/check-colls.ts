import { MongoClient } from "mongodb";

import {
  mustLoadScriptEnv,
  mustParsedValue,
} from "../../scripts/lib/script-env";

const mongodbUri = mustParsedValue(mustLoadScriptEnv("local"), "MONGODB_URI");

async function check() {
  const client = new MongoClient(mongodbUri);
  await client.connect();
  const db = client.db();
  const colls = await db.listCollections().toArray();
  console.log(
    "Collections:",
    colls.map((c) => c.name),
  );
  await client.close();
}

void check();
