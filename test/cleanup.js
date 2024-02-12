import { readdirSync, rmSync } from "fs";
import { MongoClient, ObjectID } from "mongodb";
const dir = "./uploads_integration/";

export async function cleanup() {
  readdirSync(dir).forEach((f) => rmSync(`${dir}/${f}`));
}
