var path = require('path');
var router = require('express').Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert')

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'puzzly';

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
        const puzzleId = req.params.id;
		client.connect().then((client, err) => {
			assert.strictEqual(err, undefined);
			db = client.db(dbName);
			collection = db.collection(piecesCollection);

			const data = req.body;

		  collection.insertMany(data, function(err, result){
			  if(err) throw new Error(err);
			  res.status(200).send(result.ops)
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
			const piecesQuery = { puzzleId: new ObjectID(puzzleId) }

		  const puzzle = await puzzles.findOne(puzzleQuery);
		  const piecesResult = await pieces.find().toArray();

			res.status(200).send(result)
		});
	},
	update: function(req, res){
		var data = req.body;

		client.connect().then(async (client, err) => {
			assert.strictEqual(err, undefined);
			db = client.db(dbName);
			
			let pieces = db.collection(piecesCollection);
			let query, update;
			
			data.forEach(d => {
				query = { _id: new ObjectID(d._id) };
				delete d._id;
				update = { "$set": {...d}};

				pieces.updateOne(query, update, function(err, result){
					if(err) throw new Error(err);
				});
			});

			res.status(200).send([])
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

api.unsolvePiece = function(req, res) {
	client.connect().then(async (client, err) => {
		assert.strictEqual(err, undefined);
		db = client.db(dbName);
		const id = req.params.id;
		
		let pieces = db.collection(piecesCollection);
		console.log('attempt unsolve piece', id)

		pieces.findOne({_id: new ObjectID(id)}, function(err, result, a){
			if(err) throw new Error(err);
			console.log('found piece', err, result)
			res.status(200).send("ok")
		})
	})
}

// Set API CRUD endpoints
router.get('/:puzzleId', api.read);
router.post('/:puzzleId', api.create);
router.put('/:puzzleId', api.update);

module.exports.router = router;
