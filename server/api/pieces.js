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
          data: result.ops,
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

    client.connect().then(async (client, err) => {
      const response = {};

      if (!err) {
        db = client.db(dbName);

        let pieces = db.collection(piecesCollection);
        let puzzles = db.collection(puzzlesCollection);
        let query, update;
        let puzzleId;

        try {
          puzzleId = data[0].puzzleId;

          data.forEach(async (d) => {
            // console.log("atempting to save piece", d)
            query = { _id: new ObjectID(d._id) };
            delete d._id;
            delete d.puzzleId;
            update = { $set: d };
            console.log(query);
            console.log(update);
            const result = await pieces.updateOne(query, update);
            // console.log("piece update result", result)
          });

          const puzzleUpdateQuery = {
            _id: new ObjectID(puzzleId),
          };

          const puzzleUpdateOp = {
            $set: {
              lastSaveDate: Date.now(),
            },
          };

          await puzzles.updateOne(puzzleUpdateQuery, puzzleUpdateOp);

          response.lastSaveDate = Date.now();
          res.status(200).send(response);
        } catch (e) {
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
