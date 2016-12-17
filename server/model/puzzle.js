var mongoose = require('mongoose');
var schema = mongoose.Schema;

var puzzleSchema = new schema({
	image: Object,
	numPieces: Number,
	pieces: Object,
	createdAt: Date 
});

var puzzle = mongoose.model('puzzle', puzzleSchema);

module.exports = puzzle;
