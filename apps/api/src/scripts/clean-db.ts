import { MongoClient } from "mongodb";

import {
  mustLoadScriptEnv,
  mustParsedValue,
} from "../../scripts/lib/script-env";

const mongodbUri = mustParsedValue(mustLoadScriptEnv("local"), "MONGODB_URI");

async function clean() {
  const client = new MongoClient(mongodbUri);
  await client.connect();
  const db = client.db();
  await db
    .collection("studyguides")
    .drop()
    .catch(() => {});
  await db
    .collection("StudyGuide")
    .drop()
    .catch(() => {});
  console.log("Cleaned collections");
  await client.close();
}

void clean();
