var puzzle = require('../model/puzzle.js');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var router = require('express').Router();
var puzzle = require('../model/puzzle.js');

var storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, path.join(__dirname, '../../uploads') );
	},
	filename: function(req, file, cb){
		cb(null, file.originalname);
	}
});

var api = {
	create: function(req, res){
		var data = {
			numPieces: req.body.num_pieces,
			image: req.file.path
		};

		var newPuzzle = new puzzle(data);

		newPuzzle.save()
	},
	read: function(req, res){
		var query = "\
			SELECT *\
			FROM `agents`\
		";
		if(req.params.id){
			var id = req.params.id;
			query += " WHERE agents.id = ?";
		}
		db.query(query, [id], function(err, rows){
			if(err) throw new Error(err);
			res.json(rows);
		});
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

var upload = multer({
	storage: storage
});

// Set API CRUD endpoints
router.get('/', api.read);
router.get('/:id', api.read);
router.post('/', upload.single('image'), api.create);
router.delete('/:id', api.destroy);

module.exports = router;
