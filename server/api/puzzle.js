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
		console.log(req)
		client.connect().then((client, err) => {
			assert.strictEqual(err, undefined);
			db = client.db(dbName);
			collection = db.collection(puzzlesCollection);

			const data = req.body;
			data.numberOfSolvedPieces = 0;
			data.dateCreated = new Date();
			data.elapsedTime = 0;

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

			res.status(200).send(result)
		});
	},
	update: function(req, res){
		var data = req.body;
		var id = req.params.id;

		client.connect().then(async (client, err) => {
			assert.strictEqual(err, undefined);
			db = client.db(dbName);
			
			let puzzles = db.collection(puzzlesCollection);
			let pieces = db.collection(piecesCollection);
			let query, update;
			
			if(Array.isArray(data)){
				data.forEach(d => {
					query = { puzzleId: d.puzzleId, id: d.id }
					delete d._id;
					update = { "$set": {...d}};
					console.log(update)

					pieces.updateOne(query, update, {upsert: true}, function(err, result){
						if(err) throw new Error(err);
					});
				});
			}

			const hasSolvedPieces = data.some(p => p.isSolved);
			const puzzleId = data[0].puzzleId;

			if(hasSolvedPieces){
				puzzles.findOneAndUpdate({_id: new ObjectID(puzzleId)}, {"$inc": { numberOfSolvedPieces: data.length }}, function(err, result){
					if(err) throw new Error(err);
				})
			}
			
			if(data.groupCounter !== undefined && data.groupCounter !== null){
				puzzles.findOneAndUpdate({_id: new ObjectID(id)}, {$inc: { groupCounter: 1 }}, function(err, result) {
					if(err) throw new Error(err);
				})
			}

			res.sendStatus(200)
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

api.fetchAll = function(req, res) {
	client.connect().then(async (client, err) => {
		assert.strictEqual(err, undefined);
		db = client.db(dbName);
		
		let puzzles = db.collection(puzzlesCollection);
		puzzles.find().toArray( function(err, result){
			if(err) throw new Error(err);
			res.status(200).send(result)
		})
	})
}

api.removeAll = function(req, res) {
	client.connect().then(async (client, err) => {
		assert.strictEqual(err, undefined);
		db = client.db(dbName);
		
		let puzzles = db.collection(puzzlesCollection);
		puzzles.deleteMany( function(err, result){
			if(err) throw new Error(err);
			res.status(200).send("ok")
		})
	})
}

api.updateTime = function(req, res) {
	client.connect().then(async (client, err) => {
		assert.strictEqual(err, undefined);
		db = client.db(dbName);
		let puzzles = db.collection(puzzlesCollection);

		const query = { _id: new ObjectID(req.params.id) };
		console.log('query', query)
		const update = { "$inc": { elapsedTime: req.body.time } };
		console.log('update'), update

		puzzles.updateOne(query, update, function(err, result){
			if(err) throw new Error(err);
			res.status(200).send("ok")
		})
	})
}

// Set API CRUD endpoints
router.get('/', api.read);
router.get('/fetchAll', api.fetchAll);
router.get('/removeAll', api.removeAll);
router.put('/updateTime/:id', api.updateTime);
router.get('/:id', api.read);
router.post('/', api.create);
router.put('/:id', api.update);
router.delete('/:id', api.destroy);

module.exports.router = router;
