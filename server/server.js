var http = require('http');
var	app = require('./app.js');

http.createServer(app).listen(3000);
