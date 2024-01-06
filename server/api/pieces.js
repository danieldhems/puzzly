var path = require("path");
var router = require("express").Router();

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const assert = require("assert");

// Connection URL
const url = "mongodb://127.0.0.1:27017";

// Database Name
const dbName = "puzzly";

const piecesCollection = "pieces";
const puzzlesCollection = "puzzles";

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
    client.connect().then((client, err) => {
      assert.strictEqual(err, undefined);
      db = client.db(dbName);
      collection = db.collection(piecesCollection);

      const data = req.body;
      // console.log("attempting to save pieces for first time", data);

      collection.insertMany(data, function (err, result) {
        if (err) throw new Error(err);

        const response = {
          status: "success",
          data: {
            pieceData: result.ops,
          },
        };

        res.status(200).send(response);
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

      const puzzle = await puzzles.findOne(puzzleQuery);
      const piecesResult = await pieces.find().toArray();

      res.status(200).send(result);
    });
  },
  update: function (req, res) {
    var data = req.body;
    console.log("update request", req.body);

    client.connect().then(async (client, err) => {
      if (!err) {
        db = client.db(dbName);

        let pieces = db.collection(piecesCollection);
        let puzzles = db.collection(puzzlesCollection);
        let query, update;

        const response = {};

        const lastSaveDate = Date.now();

        try {
          console.log("data", data);
          if (Array.isArray(data)) {
            for (let i = 0, l = data.length; i < l; i++) {
              const { _id, pageX, pageY, pocket } = data[i];
              await pieces.findOneAndUpdate(
                { _id: new ObjectID(_id) },
                {
                  $set: {
                    pageX: pageX,
                    pageY: pageY,
                    pocket: pocket,
                  },
                }
              );
            }
          } else {
            const pieceid = new ObjectID(data._id);
            query = { _id: pieceid };
            console.log("saving piece", data);

            const { pageX, pageY, groupId, isSolved, pocket } = data;

            update = {
              $set: {
                pageX,
                pageY,
                groupId,
                isSolved,
                pocket,
              },
            };

            console.log("Single piece: update instruction", update);
            const result = await pieces.findOneAndUpdate(query, update);
            console.log("piece update result", result.ops);
          }

          const puzzleUpdateOp = {
            $set: {
              lastSaveDate,
              complete: data.isPuzzleComplete,
            },
          };

          const puzzleUpdateQuery = {
            _id: new ObjectID(data.puzzleId),
          };

          console.log("Pieces: Updating puzzle with query", puzzleUpdateOp);

          const result = await puzzles.updateOne(
            puzzleUpdateQuery,
            puzzleUpdateOp
          );
          // console.log("piece save result", result.ops);
          response.lastSaveDate = lastSaveDate;

          res.status(200).send(response);
        } catch (e) {
          console.log("e", e);
          res.status(500).send(e);
        }
      }
    });
  },
  destroy: function (req, res) {
    var id = req.params.id;
    db.query("DROP * FROM `agents` WHERE `id` = ?", [id], function (err, rows) {
      if (err) throw new Error(err);
      console.log(rows);
    });
  },
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
  });
};

// Set API CRUD endpoints
router.get("/:puzzleId", api.read);
router.post("/", api.create);
router.put("/", api.update);

module.exports.router = router;
