var fs = require('fs');
var router = require('express').Router();

var api = {
	create: function(req, res){
		var data = req.body;
		db.query('INSERT INTO `agents` SET ?', [data], function(err, result){
			if(err) throw new Error(err);
			if(result.affectedRows===1) res.send(200, result.insertId);
		});
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
router.patch('/:id', api.update);
router.delete('/:id', api.destroy);

module.exports = router;
