var path = require('path');
var	express = require('express');
var	bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var puzzleApi = require('./api/puzzle.js');

var app = express();

app.use('/', express.static('./client'));
app.use('/uploads', express.static('./uploads'));

app.use(fileUpload({
	createParentPath: true,
	debug: true
}));
app.use(bodyParser.urlencoded({ uploadDir: path.join(__dirname, 'uploads'), keepExtensions: true, extended: true }));
app.use(bodyParser.json());

// Configure API endpoints
app.use('/api/puzzle', puzzleApi.router);
app.use('/api/upload', require('./api/upload.js'));
app.use('/api/toggleVisibility', require('./api/pieceFiltering.js'));

// Configure base URL for home page
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../client/index.html'));
});

// puzzleApi.clean();

module.exports = app;
