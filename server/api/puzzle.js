var path = require('path');
var router = require('express').Router();
var multer = require('multer');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert')

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'puzzly';

const collectionName = 'puzzles'

// Create a new MongoClient
const client = new MongoClient(url);

let db, collection;

// Use connect method to connect to the Server

var storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './uploads');
	},
	filename: function(req, file, cb){
		cb(null, file.originalname);
	}	
});

var upload = multer({storage: storage}).single('image');

var api = {
	create: function(req, res){
		var numPieces = parseInt(req.body.numPieces,10);
		upload(req, res, function(err){
			if(err) res.send('error uploading file');
			var file = req.file;
			var data = {
				image: {
					name: file.originalname,
					path: file.path
				},
				pieces: {},
				numPieces: numPieces,
				createdAt: Date.now()
			};
			
		});

	},
	read: function(req, res){
		
	},
	update: function(req, res){
		console.log("saving")
		var data = req.body;
		var id = req.params.id;

		client.connect().then((client, err) => {
			assert.strictEqual(err, undefined);
			db = client.db(dbName);
			collection = db.collection(collectionName);

			const query = { id }

		  collection.findOneAndUpdate(query, data, function(err, result){
			  if(err) throw new Error(err);
			  console.log(result);
		  });
		  res.send(200)
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
router.post('/', upload, api.create);
router.put('/:id', api.update);
router.delete('/:id', api.destroy);

module.exports = router;
