var router = require("express").Router();
// var { default: PuzzleGenerator } = require("../../common/puzzleGenerator");

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const assert = require("assert");
const fs = require("fs");

// Connection URL
const url = "mongodb://127.0.0.1:27017";

// Database Name
const dbName = "puzzly";

const puzzlesCollection = "puzzles";
const piecesCollection = "pieces";

// Create a new MongoClient
const client = new MongoClient(url);

let db, collection;

module.exports.clean = function () {
  client.connect().then((client, err) => {
    assert.strictEqual(err, undefined);
    db = client.db(dbName);
    collection = db.collection(collectionName);

    collection.remove({}, function (err, result) {
      if (err) throw new Error(err);
      console.log("DB cleaned");
    });
  });
};

var api = {
  create: function (req, res) {
    client.connect().then(async (client, err) => {
      assert.strictEqual(err, undefined);
      db = client.db(dbName);
      const puzzleColl = db.collection(puzzlesCollection);
      const piecesColl = db.collection(piecesCollection);

      const data = req.body;

      // console.log("create", data);
      data.numberOfSolvedPieces = 0;
      data.dateCreated = new Date();
      data.elapsedTime = 0;

      const timeStamp = new Date().getMilliseconds();
      const imageNameWithoutExt = data.imageName.split(".")[0];

      // These are the paths we want the sprites to be created at - they're uploaded by the client in base64
      const spritePath =
        "./uploads/sprite_" +
        imageNameWithoutExt +
        "_" +
        data.selectedNumPieces +
        "_" +
        timeStamp +
        ".png";

      var base64Data = data.spriteEncodedString.replace(
        /^data:image\/png;base64,/,
        ""
      );

      try {
        // Save to disk the puzzle sprite that the client has produced
        fs.writeFile(spritePath, base64Data, "base64", async function (err) {
          if (err) {
            console.log("fs error", err);
          }
        });
      } catch (e) {
        console.log("Error!", e);
      }

      // console.log("data from client", data);

      const dbPayload = {
        ...data,
        spritePath,
      };

      delete dbPayload.spriteEncodedString;

      const puzzleDBResponse = await puzzleColl.insertOne(dbPayload);
      const puzzleId = puzzleDBResponse.ops[0]._id;
      // console.log("puzzle DB result", puzzleDBResponse.ops[0]._id);

      data.pieces.forEach((element) => {
        element.puzzleId = puzzleId;
      });

      // console.log("data for pieces insertion", data.pieces);

      const piecesDBResponse = await piecesColl.insertMany(data.pieces);

      // console.log("puzzleDBResponse", puzzleDBResponse.ops[0]);
      // console.log("piecesDBResponse", piecesDBResponse.ops[0]);

      res.status(200).send({
        ...puzzleDBResponse.ops[0],
        ...data,
        pieces: piecesDBResponse.ops,
      });
    });
  },
  read: function (req, res) {
    const puzzleId = req.params.id;

    client.connect().then(async (client, err) => {
      assert.strictEqual(err, undefined);
      db = client.db(dbName);
      const puzzles = db.collection(puzzlesCollection);
      const pieces = db.collection(piecesCollection);

      const puzzleQuery = { _id: new ObjectID(puzzleId) };
      const piecesQuery = { puzzleId: new ObjectID(puzzleId) };

      console.log("puzzle query", puzzleQuery);
      console.log("pieces query", piecesQuery);

      const puzzle = await puzzles.findOne(puzzleQuery);
      const piecesResult = await pieces.find(piecesQuery).toArray();
      console.log("puzzle found", puzzle);
      console.log("pieces found for puzzle", puzzleId, piecesResult);

      const result = {
        ...puzzle,
        pieces: piecesResult,
      };

      res.status(200).send(result);
    });
  },
  update: function (req, res) {},
  destroy: function (req, res) {
    var id = req.params.id;
    db.query("DROP * FROM `agents` WHERE `id` = ?", [id], function (err, rows) {
      if (err) throw new Error(err);
      console.log(rows);
    });
  },
};

api.fetchAll = function (req, res) {
  client
    .connect()
    .then(async (client, err) => {
      assert.strictEqual(err, undefined);
      db = client.db(dbName);

      let puzzles = db.collection(puzzlesCollection);
      let piecesDB = db.collection(piecesCollection);

      let puzzleList = await puzzles.find().toArray();
      console.log("puzzles", puzzleList);

      const puzzlesToReturn = [];

      const query = puzzleList.map(async (p) => {
        const pieces = await piecesDB
          .find({ puzzleId: new ObjectID(p._id) })
          .toArray();
        console.log(
          `number of pieces found for puzzle ${p._id}: ${pieces.length}`
        );
        const puzzle = {
          ...p,
          pieces,
          percentSolved:
            (pieces.filter((piece) => piece.isSolved).length /
              p.selectedNumPieces) *
            100,
        };
        puzzlesToReturn.push(puzzle);
      });

      Promise.all(query).then(() => {
        console.log("collated", puzzlesToReturn);
        res.send(puzzlesToReturn);
      });
    })
    .catch((err) => {
      throw new Error(err);
    });
};

api.removeAll = function (req, res) {
  client.connect().then(async (client, err) => {
    assert.strictEqual(err, undefined);
    db = client.db(dbName);
    let coll;
    if (req.params.coll === "puzzles") {
      coll = db.collection(puzzlesCollection);
    } else if (req.params.coll === "pieces") {
      coll = db.collection(piecesCollection);
    }

    console.info("Deleting all from collection", coll);
    coll.deleteMany({}, function (err, result) {
      if (err) throw new Error(err);
      console.log(result);
      res.status(200).send("ok");
    });
  });
};

api.updateTime = function (req, res) {
  client.connect().then(async (client, err) => {
    assert.strictEqual(err, undefined);
    db = client.db(dbName);
    let puzzles = db.collection(puzzlesCollection);

    const query = { _id: new ObjectID(req.params.id) };

    const { time, isComplete } = req.body;

    const update = { $inc: { elapsedTime: time } };
    if (isComplete) {
      update["$set"] = { isComplete };
    }

    puzzles.updateOne(query, update, function (err, result) {
      if (err) throw new Error(err);
      res.status(200).send("ok");
    });
  });
};

api.unsolvePiece = function (req, res) {
  client.connect().then(async (client, err) => {
    assert.strictEqual(err, undefined);
    db = client.db(dbName);
    const id = req.params.id;

    let pieces = db.collection(piecesCollection);
    console.log("attempt unsolve piece", id);

    pieces.findOne({ _id: new ObjectID(id) }, function (err, result, a) {
      if (err) throw new Error(err);
      console.log("found piece", err, result);
      res.status(200).send("ok");
    });

    // pieces.updateOne({_id: id}, {"$set": {isSolved: false}}, function(err, result){
    // 	if(err) throw new Error(err);
    // 	console.log('Unsolved piece', result)
    // 	res.status(200).send("ok")
    // })
  });
};

// Set API CRUD endpoints
router.get("/", api.read);
router.get("/fetchAll", api.fetchAll);
router.delete("/removeAll/:coll", api.removeAll);
router.put("/updateTime/:id", api.updateTime);
router.put("/unsolvePiece/:id", api.unsolvePiece);
router.get("/:id", api.read);
router.post("/", api.create);
router.put("/:id", api.update);
router.delete("/:id", api.destroy);

module.exports.router = router;
