const {
  UPLOADS_DIR_INTEGRATION,
  UPLOADS_DIR_PROD,
} = require("../constants.cjs");

var router = require("express").Router();
var fileUpload = require("express-fileupload");
var Sharp = require("sharp");

router.use(
  fileUpload({
    createParentPath: true,
    debug: true,
  })
);

async function upload(req, res) {
  if (!req.files) {
    res.send({
      status: false,
      message: "No file uploaded",
    });
  } else {
    // console.log("upload: req object", req.body);
    //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
    let image = req.files["files[]"];

    let isIntegration = false;

    if (req.body.integration) {
      isIntegration = true;
    }

    const uploadDir = isIntegration
      ? UPLOADS_DIR_INTEGRATION
      : UPLOADS_DIR_PROD;

    //Use the mv() method to place the file in upload directory (i.e. "uploads")
    const previewPath = uploadDir + "preview_" + image.name;
    const fullSizePath = uploadDir + "fullsize_" + image.name;
    image.mv(fullSizePath);

    const imgW = parseInt(req.body.previewWidth);
    const imgH = parseInt(req.body.previewHeight);
    let resizeW, resizeH, aspectRatio;

    const previewImg = Sharp(image.data);

    const { width: actualW, height: actualH } = await previewImg.metadata();

    if (actualW > actualH) {
      aspectRatio = actualW / actualH;
    } else {
      aspectRatio = actualH / actualW;
    }

    if (actualW > actualH) {
      resizeW = Math.floor(imgW);
      resizeH = Math.floor(imgH / aspectRatio);
    } else if (actualH > actualW) {
      resizeH = Math.floor(imgH);
      resizeW = Math.floor(imgW / aspectRatio);
    }

    await previewImg
      .resize({ width: resizeW, height: resizeH })
      .toFile(previewPath);

    res.status(200).send({
      status: true,
      message: "File is uploaded",
      data: {
        previewPath: previewPath,
        fullSizePath: fullSizePath,
        filename: image.name,
        mimetype: image.mimetype,
        width: actualW,
        height: actualH,
      },
    });
  }
}

router.post("/", upload);

module.exports = router;
