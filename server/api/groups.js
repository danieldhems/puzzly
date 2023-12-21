var path = require("path");
var router = require("express").Router();

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const assert = require("assert");

// Connection URL
const url = "mongodb://127.0.0.1:27017";

// Database Name
const dbName = "puzzly";

const groupsCollection = "groups";
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
      collection = db.collection(groupsCollection);

      const data = req.body;
      delete data._id;
      console.log("attempting to create group", data);

      collection.insertOne(data, function (err, result) {
        if (err) throw new Error(err);

        console.log("group creation response", result.ops);
        const response = {
          status: "success",
          data: result.ops[0],
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
      const groups = db.collection(groupsCollection);

      const query = { puzzleId: new ObjectID(puzzleId) };
      const queryResult = await groups.find(query);

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

        let groups = db.collection(groupsCollection);
        let puzzles = db.collection(puzzlesCollection);
        let query, update;

        try {
          query = { _id: new ObjectID(data._id) };
          delete data._id;
          console.log("saving group", data);
          update = { $set: { ...data } };

          try {
            await groups.updateOne(query, update);
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

          response.lastSaveDate = lastSaveDate;

          res.status(200).send(response);
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
