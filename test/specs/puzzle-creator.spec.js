import { cleanup } from "../cleanup.js";

describe("Puzzle creator form", () => {
  afterEach(() => {
    cleanup();
  });
  it("should upload a file and create a puzzle", async () => {
    await createPuzzle();
  });
});
