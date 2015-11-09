var path = require('path');
var	express = require('express');
var	bodyParser = require('body-parser');

var app = express();

var db = require('./database.js');

app.use(express.static(path.join(__dirname,'../client')));
app.use(express.static(path.join(__dirname,'../uploads')));


// Configure API endpoints
app.use('/api/upload', require('./api/upload.js'));
app.use('/api/create', require('./api/create.js'));

// Configure base URL for home page
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../client/index.html'));
});

module.exports = app;
