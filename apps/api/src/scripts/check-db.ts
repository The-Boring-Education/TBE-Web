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
  const guides = await db.collection("studyguides").find({}).toArray();
  console.log(
    "Guides found:",
    guides.map((g) => ({ topicId: g.topicId, hasGuide: g.hasGuide })),
  );
  await client.close();
}

void check();
