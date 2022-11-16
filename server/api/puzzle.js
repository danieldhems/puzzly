var router = require('express').Router();
var { default: PuzzleGenerator } = require("./puzzleGenerator");

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
var Sharp = require('sharp');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'puzzly';

const puzzlesCollection = 'puzzles';
const piecesCollectionName = 'pieces';	

// Create a new MongoClient
const client = new MongoClient(url);

let db, collection, piecesCollection;

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
		client.connect().then(async (client, err) => {
			assert.strictEqual(err, undefined);
			db = client.db(dbName);
			puzzleCollection = db.collection(puzzlesCollection);
			piecesCollection = db.collection(piecesCollectionName);

			const data = req.body;
			console.log('create', data);
			data.numberOfSolvedPieces = 0;
			data.dateCreated = new Date();
			data.elapsedTime = 0;

			const imageNameWithoutExt = data.imageName.split(".")[0];

			let img = Sharp(data.fullSizePath);
			const imgMetadata = await img.metadata();
			const { width: origW, height: origH } = imgMetadata;

			const { width, height } = data.dimensions;

			let ratio, cropTop, cropLeft, cropP, cropSize;

			await img.resize(data.boardSize, data.boardSize);

			if(data.hasCrop){
				if(origW > origH){
					ratio = origW / origH;
				} else {
					ratio = origH / origW;
				}

				if(width > height){
					cropP = data.selectedOffsetX / width * 100;
					cropLeft = Math.floor(origW / 100 * cropP);
					cropSize = origH;
				} else {
					cropP = data.selectedOffsetY / height * 100;
					cropTop = Math.floor(origH / 100 * cropP);
					cropSize = origW;
				}

				await img.extract({ left: cropLeft || 0, top: cropTop || 0, width: cropSize, height: cropSize })
			}

			const puzzleImgPath = `./uploads/puzzle_${data.imageName}`;
			await img.toFile(puzzleImgPath);

			const timeStamp = new Date().getMilliseconds();
			const spritePath = './uploads/sprite_' + imageNameWithoutExt + '_' + data.selectedNumPieces + "_" + timeStamp;
			const shadowSpritePath = './uploads/shdsprite_' + imageNameWithoutExt + '_' + data.selectedNumPieces + "_" + timeStamp;

			const spritePathWithExt = spritePath + ".png";
			const shadowSpritePathWithExt = shadowSpritePath + ".png";

			const generator = await PuzzleGenerator(puzzleImgPath, data, spritePath, shadowSpritePath);

			const pieceConfigData = {
				pieceSize: generator.pieceSize,
				connectorSize: generator.connectorSize,
				connectorWidth: generator.connectorWidth,
				connectorDistanceFromCorner: generator.connectorDistanceFromCorner,
			}

			const dbPayload = {
				...data,
				...pieceConfigData,
				puzzleImgPath,
				spritePath: spritePathWithExt,
				shadowSpritePath: shadowSpritePathWithExt,
			};

			puzzleCollection.insertOne(dbPayload)
			.then(async (result) => {
				console.log("puzzle added to DB", result.ops)
				const puzzleId = result.ops[0]._id;
				const pieces = await generator.generateDataForPuzzlePieces(puzzleId);
				
				const presult = await piecesCollection.insertMany(pieces);
				// console.log("piece insertion result", presult)

				res.status(200).send({
					...result.ops[0],
					pieces,
					...pieceConfigData,
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
			const pieces = db.collection(piecesCollectionName);

			const puzzleQuery = { _id: new ObjectID(puzzleId) }
			const piecesQuery = { puzzleId: new ObjectID(puzzleId) }

		  const puzzle = await puzzles.findOne(puzzleQuery);
		  const piecesResult = await pieces.find(piecesQuery).toArray();
			console.log('puzzle found', puzzle)
		  console.log('pieces found for puzzle', puzzleId, piecesResult)

		  const result = {
			  ...puzzle,
			  pieces: piecesResult
		  }

			res.status(200).send(result)
		});
	},
	update: function(req, res){

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
	client.connect().then( async (client, err) => {
		assert.strictEqual(err, undefined);
		db = client.db(dbName);
		
		let puzzles = db.collection(puzzlesCollection);
		let piecesDB = db.collection(piecesCollection);

		let puzzleList = await puzzles.find().toArray();
		let puzzleIds = puzzleList.map(p => p._id);

		let pieces = await puzzleIds.map(id => {
			return piecesDB.find({puzzleId: id.toString()}, (err, d) => d)
		});

		let result = puzzleList.map(p => ({
			...p,
			percentSolved: pieces.filter(piece => piece.isSolved).length / p.selectedNumPieces * 100
		}))

		const d = await puzzles.find().map(async p => {
			const pieces = await piecesDB.find({puzzleId: p._id.toString()}).toArray();
			return {
				...p,
				percentSolved: pieces.filter(piece => piece.isSolved).length / p.selectedNumPieces * 100
			}
		})
		
		res.send(result)

	}).catch(err => {
		throw new Error(err)
	})
}

api.removeAll = function(req, res) {
	client.connect().then(async (client, err) => {
		assert.strictEqual(err, undefined);
		db = client.db(dbName);
		let coll;
		if(req.params.coll === 'puzzles'){
			coll = db.collection(puzzlesCollection);
		} else if(req.params.coll === 'pieces'){
			coll = db.collection(piecesCollection);
		}

		console.info('Deleting all from collection', coll)
		coll.deleteMany({}, function(err, result){
			if(err) throw new Error(err);
			console.log(result)
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

		const { time, isComplete } = req.body;
		
		const update = { "$inc": { elapsedTime: time } };
		if(isComplete){
			update["$set"] =  { isComplete };
		}

		puzzles.updateOne(query, update, function(err, result){
			if(err) throw new Error(err);
			res.status(200).send("ok")
		})
	})
}

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

		// pieces.updateOne({_id: id}, {"$set": {isSolved: false}}, function(err, result){
		// 	if(err) throw new Error(err);
		// 	console.log('Unsolved piece', result)
		// 	res.status(200).send("ok")
		// })
	})
}

// Set API CRUD endpoints
router.get('/', api.read);
router.get('/fetchAll', api.fetchAll);
router.delete('/removeAll/:coll', api.removeAll);
router.put('/updateTime/:id', api.updateTime);
router.put('/unsolvePiece/:id', api.unsolvePiece);
router.get('/:id', api.read);
router.post('/', api.create);
router.put('/:id', api.update);
router.delete('/:id', api.destroy);

module.exports.router = router;
