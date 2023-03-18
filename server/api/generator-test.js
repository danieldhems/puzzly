var router = require('express').Router();
var { default: PuzzleGenerator } = require("../../common/puzzleGenerator");

async function generate(req, res){
    const { pieceTypes } = req.body;
    const config = {
        ...req.body,
    };

    const generator = await PuzzleGenerator(config);

    const generatedPieces = [];

    let piece = { type: pieceTypes };
    generatedPieces.push(generator.drawJigsawShape(piece));

   res.status(200).send({
    generator,
    generatedPieces
   });
}

router.post("/", generate);

module.exports = router;
