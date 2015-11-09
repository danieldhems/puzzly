var mongoose = require('mongoose');
var schema = mongoose.Schema;

var puzzleSchema = new schema({
	image: String,
	numPieces: Number,
	progress: Array,
	dateCreated: Date 
});

var puzzle = mongoose.model('puzzle', puzzleSchema);

module.exports = puzzle;
