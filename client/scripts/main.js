import Utils from "./utils.js";

// Utils.drawBackground();

document.body.onload = function () {
  const puzzleId = Utils.getQueryStringValue("puzzleId");

  if (puzzleId) {
    fetch(`/api/puzzle/${puzzleId}`)
      .then((response) => response.json())
      .then((response) => {
        console.log("puzzle fetched", response);
        window.Puzzly = new Puzzly("canvas", puzzleId, response);
      });
  } else {
    new PuzzlyCreator();
  }
};
