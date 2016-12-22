var path = require('path');
var router = require('express').Router();
var multer = require('multer');
var puzzle = require('../model/puzzle.js');

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
			var newPuzzle = new puzzle(data);
			newPuzzle.save( function(err, doc){
				if(err) console.log(err);
				console.log('new document saved: ', doc)
				res.send(doc);
			});
		});

	},
	read: function(req, res){
		
		
	},
	update: function(req, res){
		var data = req.body;
		var id = req.params.id;
		db.query('UPDATE `agents` SET ? WHERE `id` = ?', [data, id], function(err, result){
			if(err) throw new Error(err);
			console.log(result);
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
router.delete('/:id', api.destroy);

module.exports = router;
