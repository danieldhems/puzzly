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
			const puzzles = db.collection(puzzlesCollection);
			const pieces = db.collection(piecesCollection);

			const puzzleQuery = { _id: new ObjectID(puzzleId) }
			const piecesQuery = { puzzleId: puzzleId }

		  const puzzle = await puzzles.findOne(puzzleQuery);
		  const piecesResult = await pieces.find(piecesQuery).toArray();

		  const result = {
			  ...puzzle,
			  pieces: piecesResult
		  }
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
			
			collection = db.collection(piecesCollection);
			let query;
			
			if(data.length === 1){
				query = { _id: new ObjectID(data[0]._id) }

				console.log("replacing", data[0])
				delete data[0]._id;
				collection.replaceOne(query, data[0], function(err, result){
					if(err) throw new Error(err);
					console.log("updated piece", result);
					res.status(200).send();
				});
			} else {
				query = { _id: new ObjectID(id) }

				const result = await collection.find(query).toArray();

				if(!result.pieces){
					collection.insertMany(data, function(err, result){
						if(err) throw new Error(err);
						res.send(200)
					});
				} else {
					console.log("updating pieces", d)
					data.map(async d => {
						await collection.findOneAndUpdate({id: d.id}, d, function(err, result){
							if(err) throw new Error(err);
							console.log(result.ops);
						});
						res.send(200)
					})
				}
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
