var router = require("express").Router();
// var { default: PuzzleGenerator } = require("../../common/puzzleGenerator");

async function generate(req, res) {
  const { pieceTypes } = req.body;
  const config = {
    ...req.body,
  };

  console.log("pieceTypes", pieceTypes);

  const generator = await PuzzleGenerator(config);

  const generatedPieces = [];

  for (let i = 0, l = pieceTypes.length; i < l; i++) {
    let piece = { type: pieceTypes[i] };
    generatedPieces.push(generator.drawJigsawShape(piece));
  }

  res.status(200).send({
    generator,
    generatedPieces,
  });
}

router.post("/", generate);

module.exports = router;
