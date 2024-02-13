import { readdirSync, rmSync } from "fs";
import { api } from "../server/api/puzzle.cjs";

const dir = "./uploads_integration/";

export async function cleanup() {
  const url = await browser.getUrl();
  const urlParams = new URLSearchParams(url);
  const puzzleId = urlParams.get("puzzleId");
  readdirSync(dir).forEach((f) => rmSync(`${dir}/${f}`));
  await api.destroy({ id: puzzleId, integration: true });
}
