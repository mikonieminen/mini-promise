#!/usr/bin/nodejs
var port = 8081;

var connect = require('connect');
var connectRoute = require('connect-route');
var fs = require('fs');
var http = require('http');
var app = connect();
var server = http.createServer(app);

app.use(connect.logger('dev'));

app.use(connectRoute(function(router) {
    // Add some artifical load delay
    // router.get('path/to/the/script.js', function(req, res, next) {
    //     setTimeout(function() {
    //         res.writeHead(200, {'Content-Type': 'text/javascript'});
    //         var stream = fs.createReadStream(__dirname + '/path/to/the/script.js', { flags: "r" });
    //         stream.pipe(res);
    //     }, 1000);
    // });
}));

// These tests require mini-module expects it to be cloned as a sibling folder to this project.
// In other words, mini-module.js is expected to be found from ../../mini-module/mini-module.js.

app.use(connect.static(__dirname + '/../..', {maxAge: 1}));
console.log("Serving files from " + __dirname + "/../.." + ", access: http://localhost:" + port);
server.listen(port);
