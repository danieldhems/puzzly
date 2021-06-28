var path = require('path');
var	express = require('express');
var	bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');

var app = express();

app.use('/', express.static('./client'));
app.use('/uploads', express.static('./uploads'));

app.use(bodyParser.urlencoded({ uploadDir: path.join(__dirname, 'uploads'), keepExtensions: true, extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({
    createParentPath: true,
	debug: true
}));

// Configure API endpoints
app.use('/api/puzzle', require('./api/puzzle.js'));

// Configure base URL for home page
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/new', function(req, res){
	res.sendFile(path.join(__dirname, '../client/new.html'));
});

module.exports = app;
