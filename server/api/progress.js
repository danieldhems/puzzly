var fs = require('fs');
var router = require('express').Router();

var api = {
	
};


// Set API CRUD endpoints
router.get('/', api.read);
router.get('/:id', api.read);
router.post('/', api.create);
router.put('/:id', api.update);
router.patch('/:id', api.update);
router.delete('/:id', api.destroy);

module.exports = router;
