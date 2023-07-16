var Sharp = require("sharp");
var router = require("express").Router();

async function makeImage(data, puzzleImgPath) {
  // Create the resized and cropped puzzle preview image from the uploaded source image
  img = Sharp(data.fullSizePath);

  const imgMetadata = await img.metadata();
  const { width: origW, height: origH } = imgMetadata;

  const opts = {
    left: Math.floor((origW / 100) * data.leftOffsetPercentage),
    top: Math.floor((origH / 100) * data.topOffsetPercentage),
    width: Math.floor((origW / 100) * data.widthPercentage),
    height: Math.floor((origH / 100) * data.heightPercentage),
  };

  img.extract(opts);

  const isSquare = origW === origH;
  const resizeWidth = isSquare ? origW : origW < origH ? origW : origH;
  const resizeHeight = isSquare ? origH : origH < origW ? origH : origW;

  img.resize(resizeWidth, resizeHeight);

  await img.toFile(puzzleImgPath);

  return puzzleImgPath;
}

async function main(req, res) {
  const data = req.body;

  const puzzleImgPath = `./uploads/puzzle_${data.imageName}`;
  const puzzleImagePath = await makeImage(data, puzzleImgPath);

  res.status(200).send({ puzzleImagePath });
}

router.post("/", main);

module.exports = router;
