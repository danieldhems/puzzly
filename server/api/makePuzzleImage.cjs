var Sharp = require("sharp");
var router = require("express").Router();

async function makeImage(data) {
  console.log("makeImage", data);

  // Location of existing fulllsize image
  const fullsizeImagePath = `./uploads/fullsize_${data.imageName}`;

  // Intended location for resized image once we've generated it
  const resizedImagePath = `./uploads/puzzle_${data.imageName}`;

  img = Sharp(fullsizeImagePath);

  // const imgMetadata = await img.metadata();
  const { width: origW, height: origH } = data.dimensions;

  const opts = {
    left: Math.ceil((origW / 100) * data.leftOffsetPercentage),
    top: Math.ceil((origH / 100) * data.topOffsetPercentage),
    width: Math.ceil((origW / 100) * data.widthPercentage),
    height: Math.ceil((origH / 100) * data.heightPercentage),
  };

  console.log("image extraction options", opts)

  img.extract(opts);

  // Resize the image according to the dimensions requested by the Frontend
  img.resize(data.resizeWidth, data.resizeHeight);

  await img.toFile(resizedImagePath);
  return resizedImagePath;
}

async function main(req, res) {
  const data = req.body;

  const puzzleImagePath = await makeImage(data);

  res.status(200).send({ puzzleImagePath });
}

router.post("/", main);

module.exports = router;
