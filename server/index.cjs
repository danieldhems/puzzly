var http = require("http");
var app = require("./app.cjs");

http.createServer(app).listen(3001);
