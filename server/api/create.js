var db = require('../database.js');
var router = require('express').Router();

var api = {
	create: function(req, res){
		var data = req.body;
		db.query('INSERT INTO `interviews` SET ?', [data], function(err, result){
			if(err) throw new Error(err);
			if(result.affectedRows===1) res.send(200, result.insertId);
		});
	},
	read: function(req, res){
		var query = "\
			SELECT *\
			FROM `interviews` i\
			LEFT JOIN `agents` a\
				ON i.agent_id = a.id\
			LEFT JOIN `roles` r\
				ON i.role_id = r.id\
		";
		var id = "";
		if(req.params.id){
			id = req.params.id;
			query += " WHERE i.id = ?";
		}
		db.query(query, [id], function(err, rows){
			if(err) throw new Error(err);
			res.json(rows);
		});
	},
	update: function(req, res){
		var data = req.body;
		var id = req.params.id;
		db.query('UPDATE `interviews` SET ? WHERE `id` = ?', [data, id], function(err, result){
			if(err) throw new Error(err);
			console.log(result);
		});
	},
	destroy: function(req, res){
		var id = req.params.id;
		db.query('DROP * FROM `interviews` WHERE id = ?', [id], function(err, rows){
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
