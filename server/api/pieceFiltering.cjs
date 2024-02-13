var router = require("express").Router();

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const ObjectID = require("mongodb").ObjectID;
const getDatabaseCollections = require("./getDatabaseCollections.cjs").default;

const dbName = "puzzly";

async function toggleVisibility(req, res) {
  var id = req.params.id;
  try {
    client.connect().then(async (client, err) => {
      assert.strictEqual(err, undefined);
      const db = client.db(dbName);

      const isVisible = req.body.piecesVisible;
      const { puzzles } = getDatabaseCollections(db, req.body);

      puzzles.findOneAndUpdate(
        { _id: new ObjectID(id) },
        { $set: { innerPiecesVisible: isVisible } },
        { upsert: true },
        function (err, result) {
          if (err) throw new Error(err);
        }
      );

      res.send(200);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

router.put("/:id", toggleVisibility);

module.exports = router;
