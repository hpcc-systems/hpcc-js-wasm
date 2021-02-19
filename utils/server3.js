
var http = require('http');
var url = require('url');
var serveStatic = require('serve-static');

// Serve up public folder 
var servePublic = serveStatic('public', {
    'index': false
});

var server = http.createServer(function (req, res) {
    servePublic(req, res, function () {
        var query = (url.parse(req.url, true).query || {});
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<link rel="stylesheet" href="style.css">');
        res.write('<form method="GET"><label>Your name: <input name="name"></label></form>');
        res.write('<div id="welcome"></div>');
        res.write('<script>var initData = ' + JSON.stringify(query) + ';</script>');
        res.write('<script src="jquery-3.2.1.min.js"></script>');
        res.write('<script src="jquery.lettering.js"></script>');
        res.write('<script src="app.js"></script>');
        res.end();
    });
});

console.log('Server running at http://127.0.0.1:8080/');
server.listen(8080);