var router = require("express").Router();
var fileUpload = require("express-fileupload");
var Sharp = require("sharp");

const uploadDir = "./uploads/";

router.use(
  fileUpload({
    createParentPath: true,
    debug: true,
  })
);

async function uploadPuzzleSprite(req, res) {
  let image = req.files["files[]"];
  console.log("uploadPuzzleSprite api", image);
  if (!req.uploadPuzzleSprite) {
    res.send({
      status: false,
      message: "No file uploaded",
    });
  } else {
    let image = req.files["files[]"];
    console.log("upload api image", image);

    const imgSavePath = uploadDir + "puzzle_sprite_" + image.name;

    const previewImg = Sharp(image.data);
    await previewImg.toFile(imgSavePath);

    res.status(200).send({
      status: true,
      message: "File is uploaded",
      data: {
        previewPath: previewPath,
        filename: image.name,
        mimetype: image.mimetype,
      },
    });
  }
}

router.post("/", uploadPuzzleSprite);

module.exports = router;
