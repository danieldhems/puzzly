var path = require("path");
var router = require("express").Router();

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const assert = require("assert");

// Connection URL
const url = "mongodb://127.0.0.1:27017";

// Database Name
const dbName = "puzzly";

const groupsCollectionName = "groups";
const puzzlesCollectionName = "puzzles";
const piecesCollectionName = "pieces";

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
      const groupsCollection = db.collection(groupsCollectionName);
      const piecesCollection = db.collection(piecesCollectionName);

      const data = req.body;
      // delete data._id;
      // delete data.puzzleId;
      console.log("attempting to create group", data);

      const pieceUpdateResults = [];

      try {
        const groupSaveResult = await groupsCollection.insertOne(data);
        console.log("group creation response", groupSaveResult.ops);

        for (let i = 0, l = data.pieces.length; i < l; i++) {
          pieceUpdateResults.push(
            await piecesCollection.findOneAndUpdate(
              { _id: new ObjectID(data.pieces[i]._id) },
              { $set: { groupId: data._id } }
            )
          );
        }

        const response = {
          status: "success",
          data: {
            pieces: pieceUpdateResults.map((result) => result.value),
            _id: groupSaveResult.ops[0]._id,
          },
        };

        res.status(200).send(response);
      } catch (error) {
        console.error(error);
      }
    });
  },
  read: function (req, res) {
    const puzzleId = req.params.id;

    client.connect().then(async (client, err) => {
      assert.strictEqual(err, undefined);
      db = client.db(dbName);
      const groupsCollection = db.collection(groupsCollectionName);

      const query = { puzzleId };
      console.log("group read query", query);
      const queryResult = await groupsCollection.find(query);

      res.status(200).send(queryResult);
    });
  },
  update: function (req, res) {
    var data = req.body;
    console.log("update group request", req.body);

    client.connect().then(async (client, err) => {
      const response = {};

      if (!err) {
        db = client.db(dbName);

        let groups = db.collection(groupsCollectionName);
        let puzzles = db.collection(puzzlesCollectionName);
        let query, update;

        try {
          const groupId = new ObjectID(data._id);
          query = { _id: groupId };
          // console.log("saving group", data);
          update = {
            $set: {
              position: { top: data.top, left: data.left },
              isSolved: data.isSolved,
            },
          };

          try {
            const result = await groups.findOneAndUpdate(query, update);
            console.log("group update result", result.ops);
          } catch (error) {
            console.error("Failed to update group:", error);
          }

          const puzzleUpdateQuery = {
            _id: new ObjectID(data.puzzleId),
          };

          const lastSaveDate = Date.now();

          const puzzleUpdateOp = {
            $set: {
              lastSaveDate,
            },
          };

          await puzzles.updateOne(puzzleUpdateQuery, puzzleUpdateOp);

          res.status(200).send({});
        } catch (e) {
          console.log("group update error", e);
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

// Set API CRUD endpoints
router.get("/:puzzleId", api.read);
router.post("/", api.create);
router.put("/", api.update);

module.exports.router = router;
