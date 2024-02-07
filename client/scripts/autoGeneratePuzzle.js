const originalImageSize = {
  width: 1680,
  height: 1050,
};
const boardSize = 300;
const imageSize = 1050;

const image = new Image();
image.src = "/halflife-3-2.jpg";

image.addEventListener("load", async (event) => {
  console.log("image loaded", event);
  upload();
});

function upload() {
  console.log("image to upload", image);

  const fd = new FormData();
  fd.append("files[]", image);
  fd.append("previewWidth", 150);
  fd.append("previewHeight", 150);
  fd.append("boardSize", 300);

  return fetch("/api/upload", {
    body: fd,
    method: "POST",
  }).then((response) => response.json());
}

upload()
  .then(async function (d) {
    await createPuzzle();
  })
  .catch(function (err) {
    console.log(err);
  });

const cropData = {
  hasCrop: true,
  topOffsetPercentage: 0,
  leftOffsetPercentage: 0,
  heightPercentage: 100,
  widthPercentage: 100,
};

async function createPuzzle() {
  const puzzleData = {
    image,
    ...cropData,
    stageWidth: window.innerWidth,
    stageHeight: window.innerHeight,
    selectedNumPieces: 9,
    imagePreviewType: this.imagePreviewType,
  };

  const makePuzzleImageResponse = await fetch("/api/makePuzzleImage", {
    body: JSON.stringify(puzzleData),
    method: "POST",
    headers: {
      "Content-Type": "Application/json",
    },
  });

  const { puzzleImagePath } = await makePuzzleImageResponse.json();

  const generator = await puzzleGenerator(puzzleImagePath, puzzleData);

  const { spriteEncodedString, pieces, config } =
    await generator.generateDataForPuzzlePieces();

  Object.assign(puzzleData, {
    spriteEncodedString,
    puzzleImagePath,
    pieces,
    ...config,
  });

  fetch("/api/puzzle", {
    body: JSON.stringify(puzzleData),
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then(
      function (response) {
        console.log("response", response);
        const puzzleId = response._id;

        Utils.insertUrlParam("puzzleId", puzzleId);

        this.newPuzzleForm.style.display = "none";

        puzzleData.pieces = response.pieces;
        puzzleData.spritePath = response.spritePath;
        puzzleData.previewPath = response.previewPath;

        new Puzzly("canvas", puzzleId, puzzleData);
      }.bind(this)
    )
    .catch(function (err) {
      console.log(err);
    });
}
