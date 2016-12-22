var path = require('path');
var	express = require('express');
var	bodyParser = require('body-parser');

var app = express();

// var db = require('./database.js');

app.use('/', express.static('./dist'));
app.use('/uploads', express.static('./uploads'));

app.use(bodyParser.urlencoded({ uploadDir: path.join(__dirname, 'uploads'), keepExtensions: true, extended: true }));

// Configure API endpoints
app.use('/api/new', require('./api/new.js'));

// Configure base URL for home page
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../client/index.html'));
});

module.exports = app;
