var path = require('path');
var router = require('express').Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert')

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'puzzly';

const puzzlesCollection = 'puzzles'
const piecesCollection = 'pieces'

// Create a new MongoClient
const client = new MongoClient(url);

let db, collection;

module.exports.clean = function(){
	client.connect().then((client, err) => {
		assert.strictEqual(err, undefined);
		db = client.db(dbName);
		collection = db.collection(collectionName);

	  collection.remove(({}), function(err, result){
		  if(err) throw new Error(err);
		  console.log("DB cleaned")
	  });
	});
}

var api = {
	create: function(req, res){
		client.connect().then((client, err) => {
			assert.strictEqual(err, undefined);
			db = client.db(dbName);
			collection = db.collection(puzzlesCollection);

			const data = req.body;

		  collection.insertOne(data, function(err, result){
			  if(err) throw new Error(err);
			  console.log(result)
			  res.status(200).send({
				  ...result.ops[0]
			  })
		  });
		});
	},
	read: function(req, res){
		const puzzleId = req.params.id;

		client.connect().then( async (client, err) => {
			assert.strictEqual(err, undefined);
			db = client.db(dbName);
			collection = db.collection(piecesCollection);

			const query = { puzzleId: new ObjectID(puzzleId) }
			console.log("retrieving puzzle", query)

		  const result = await collection.findOne(query);
		  console.log(result)
			res.status(200).send(result)
		});
	},
	update: function(req, res){
		var data = req.body;
		var id = req.params.id;

		client.connect().then(async (client, err) => {
			assert.strictEqual(err, undefined);
			db = client.db(dbName);
			collection = db.collection(collectionName);

			let query, update, options;
			
			if(data.length === 1){
				query = { puzzleId: new ObjectID(id), id: data.id }

				// console.log("query", query)
				// console.log("update", update)
				piecesCollection.replaceOne(query, data[0], options, function(err, result){
					if(err) throw new Error(err);
					console.log(result);
					res.status(200).send()
				});
			} else {
				query = { _id: new ObjectID(id) }

				const result = await collection.find(query).toArray();
				console.log("found documents with id", id, result)

				if(!result.pieces){
					update = { $set: { "pieces": data } };
				}
				
				collection.updateOne(query, update, function(err, result){
					if(err) throw new Error(err);
					console.log(result);
					res.send(200)
				});
			}
		});

	},
	destroy: function(req, res){
		var id = req.params.id;
		db.query('DROP * FROM `agents` WHERE `id` = ?', [id], function(err, rows){
			if(err) throw new Error(err);
			console.log(rows);
		});
	}
};


// Set API CRUD endpoints
router.get('/', api.read);
router.get('/:id', api.read);
router.post('/', api.create);
router.put('/:id', api.update);
router.delete('/:id', api.destroy);

module.exports.router = router;
