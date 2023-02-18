var path = require('path');
var	express = require('express');
var	bodyParser = require('body-parser');
var puzzleApi = require('./api/puzzle.js');
var piecesApi = require('./api/pieces.js');
var upload = require('./api/upload.js');

var app = express();

app.use('/', express.static('./client'));
app.use('/uploads', express.static('./uploads'));
app.use('/common', express.static('./common'));

app.use(bodyParser.urlencoded({ uploadDir: path.join(__dirname, 'uploads'), keepExtensions: true, extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));

// Configure API endpoints
app.use('/api/puzzle', puzzleApi.router);
app.use('/api/pieces', piecesApi.router);
app.use('/api/upload', upload);
app.use('/api/toggleVisibility', require('./api/pieceFiltering.js'));

// Configure base URL for home page
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/gallery', function(req, res){
	res.sendFile(path.join(__dirname, '../client/puzzleGallery.html'));
});

app.get('/exp', function(req, res){
	res.sendFile(path.join(__dirname, '../client/experiment.html'));
});

app.get('/removeAll', function(req, res){
	res.sendFile(path.join(__dirname, '../client/removeAll.html'));
});

app.get('/unsolvePiece', function(req, res){
	res.sendFile(path.join(__dirname, '../client/unsolvePiece.html'));
});

app.get('/new', function(req, res){
	res.sendFile(path.join(__dirname, '../client/new.html'));
});

// puzzleApi.clean();

module.exports = app;
