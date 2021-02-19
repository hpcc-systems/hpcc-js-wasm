var http = require('http');
var uuidv4 = require('uuid/v4');
var bcrypt = require('bcrypt');
var url = require('url');
var qs = require('querystring');
var escape_html = require('escape-html');
var serveStatic = require('serve-static');


// Serve up public folder 
var servePublic = serveStatic('public', {
    'index': false
});

var accounts = {
    'bilbo': '$2a$10$j4UG7ZLXNicdhoS2Gh.4g.06wMxOkm9GQdh1XJGS1wcnOHrne4Tci'
};
var sessions = {};

function secretStuff(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Hello, ' + escape_html(req.session.username) + '!</h1>' +
        '<p>LOLCorp secrets go here...</p>' +
        '<div><a href="/logout">Logout</a></div>');
}

function loginForm(req, res, errors) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1><img src="padlock1.gif"> LOLCorp Login</h1>');
    res.write('<ul>');
    errors.forEach(function (msg) {
        res.write('<li>' + escape_html(msg) + '</li>');
    });
    res.write('</ul>');
    res.end('<form method="POST">' +
        '<div>' +
        '<label>Username: <input type="text" name="username"></label>' +
        '</div>' +
        '<div>' +
        '<label>Password: <input type="password" name="password"></label>' +
        '</div>' +
        '<button>Login</button>' +
        '</form>');
}

function redirect(res, url) {
    res.writeHead(303, { 'Location': url });
    res.end();
}

var server = http.createServer(function (req, res) {
    servePublic(req, res, function () {
        var location = url.parse(req.url, true);
        var sessionid = location.query.sessionid || uuidv4();
        req.session = sessions[sessionid];
        if (!req.session) {
            // create new session
            req.session = sessions[sessionid] = {};
        }
        if (location.pathname == '/') {
            if (!req.session.username) {
                // not logged in!
                redirect(res, '/login?sessionid=' + qs.escape(sessionid));
                return;
            }
            secretStuff(req, res);
            return;
        }
        else if (location.pathname == '/login') {
            if (req.method == 'GET') {
                if (req.session.username) {
                    // already logged in
                    redirect(res, '/?sessionid=' + qs.escape(sessionid));
                    return;
                }
                loginForm(req, res, []);
                return;
            }
            else if (req.method == 'POST') {
                var body = '';
                req.on('data', function (data) {
                    body += data;
                });
                req.on('end', function () {
                    var form = qs.parse(body);
                    var hash = accounts[form.username];
                    if (hash && bcrypt.compareSync(form.password, hash)) {
                        // logged in
                        req.session.username = form.username;
                        redirect(res, '/?sessionid=' + qs.escape(sessionid));
                        return;
                    }
                    else {
                        req.session.username = null;
                        loginForm(req, res, ['Login failed']);
                        return;
                    }
                });
            }
        }
        else if (location.pathname == '/logout') {
            // create new session
            sessionid = uuidv4();
            req.session = sessions[sessionid] = {};
            redirect(res, '/login?sessionid=' + qs.escape(sessionid));
            return;
        }
    });
});

console.log('Server running at http://127.0.0.1:8080/');
server.listen(8080);