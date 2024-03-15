import Puzzly from "./Puzzly";
import PuzzlyCreator from "./puzzlyCreator";
import Utils from "./utils";

// Utils.drawBackground();

document.body.onload = function () {
  const puzzleId = Utils.getQueryStringValue("puzzleId");

  if (puzzleId) {
    fetch(`/api/puzzle/${puzzleId}`)
      .then((response) => response.json())
      .then((response) => {
        console.log("puzzle fetched", response);
        window.Puzzly = new Puzzly(puzzleId, response);
      });
  } else {
    new PuzzlyCreator();
  }
};
