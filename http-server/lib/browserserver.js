/*global process:false require:false exports:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

var sys = require('sys'),
    http = require('http'),
    fs = require('fs'),
    url = require('url')
// ,events = require('events')
;

var options;


// function main(argv) {
//     // if(argv[2] === '-h') {
//     //   sys.puts('Usage: \nbrowserserver [port [ipaddr]] defaulting to 127.0.0.1:8000');
//     //   sys.puts('Or set environment variables BROWSERSERVER_PORT and BROWSERSERVER_IPADDR');
//     //   return;
//     // }
//     // else  sys.puts('-h for help');
//     // var port = Number(argv[2]) || Number(process.env.BROWSERSERVER_PORT) ||
//     //     process.env.OPENSHIFT_INTERNAL_PORT || 8000;
//     // var ipaddr = argv[3] || process.env.BROWSERSERVER_IPADDR || process.env.OPENSHIFT_INTERNAL_IP || '127.0.0.1';
//     var server = new HttpServer({
//         'GET': createServlet(StaticServlet),
//         'HEAD': createServlet(StaticServlet)
//     });
//     return server;

//     // .start(ipaddr, port);
// }

function escapeHtml(value) {
  return value.toString().
    replace('<', '&lt;').
    replace('>', '&gt;').
    replace('"', '&quot;');
}

function createServlet(Class) {
  var servlet = new Class();
  return servlet.handleRequest.bind(servlet);
}

/**
 * An Http server implementation that uses a map of methods to decide
 * action routing.
 *
 * @param {Object} Map of method => Handler function
 */
function HttpServer(handlers) {
  this.handlers = handlers;
  this.server = http.createServer(this.handleRequest_.bind(this));
}

// HttpServer.prototype.start = function(ip,port) {
//   this.server.listen(port, ip);
//   sys.puts('Http Server running at http://' + ip + ':'+ port);
// };

HttpServer.prototype.parseUrl_ = function(urlString) {
  var parsed = url.parse(urlString);
  parsed.pathname = url.resolve('/', parsed.pathname);
  return url.parse(url.format(parsed), true);
};

function error(response, err, reason, code) {
    sys.log('Error '+code+': '+err+' ('+reason+').');
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({ err: err, reason: reason }));
    response.end();
}


function unknownError(response, e) {
    sys.log(e.stack);
    error(response, 'unknown', 'Unexpected error.', 500);
}

function forwardRequest(inRequest, inResponse, uri) {
    sys.log(inRequest.method + ' ' + uri);

    uri = url.parse(uri);
    var out = http.createClient(uri.port||80, uri.hostname);
    var path = uri.pathname + (uri.search || '');
    var headers = inRequest.headers;
    headers.host = uri.hostname + ':' + (uri.port||80);
    headers['x-forwarded-for'] = inRequest.connection.remoteAddress;
    headers.referer = 'http://' + uri.hostname + ':' + (uri.port||80) + '/';

    var outRequest = out.request(inRequest.method, path, headers);

    out.on('error', function(e) { unknownError(inResponse, e); });
    outRequest.on('error', function(e) { unknownError(inResponse, e); });

    inRequest.on('data', function(chunk) { outRequest.write(chunk); });
    inRequest.on('end', function() {
        outRequest.on('response', function(outResponse) {
            // nginx does not support chunked transfers for proxied requests
            delete outResponse.headers['transfer-encoding'];

            if (outResponse.statusCode === 503) {
                return error(inResponse, 'db_unavailable', 'Database server not available.', 502);
            }

            inResponse.writeHead(outResponse.statusCode, outResponse.headers);
            outResponse.on('data', function(chunk) { inResponse.write(chunk); });
            outResponse.on('end', function() { inResponse.end(); });
        });
        outRequest.end();
    });
}

var PREFIX = '/db/';
var TARGET = 'http://localhost:5984';
HttpServer.prototype.handleRequest_ = function(req, res) {
    var logEntry = req.method + ' ' + req.url;
    if (req.headers['user-agent']) {
        logEntry += ' ' + req.headers['user-agent'];
    }
    sys.puts(logEntry);
    // Object.keys(req).forEach(function(k) {
    //   sys.puts(k + '=' + req[k]);  
    // });
    req.url = this.parseUrl_(req.url);
    var u = url.parse(req.url);
    if (u.pathname.substring(0, PREFIX.length) === PREFIX) {
        u = TARGET + u.pathname.substring(PREFIX.length-1) + (u.search||'');
        forwardRequest(req, res, u);
        return;
    }
    var handler = this.handlers[req.method];
    if (!handler) {
        res.writeHead(501);
        res.end();
    } else {
        handler.call(this, req, res);
    }
};

/**
 * Handles static content.
 */
function StaticServlet() {}

StaticServlet.MimeMap = {
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'xml': 'application/xml',
  'json': 'application/json',
  'js': 'application/javascript',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'png': 'image/png',
  'appcache': 'text/cache-manifest'
};

StaticServlet.prototype.handleRequest = function(req, res) {
    var self = this;
    var path = ('./' + req.url.pathname).replace('//','/').replace(/%(..)/, function(match, hex){
        return String.fromCharCode(parseInt(hex, 16));
    });
    
    var parts = path.split('/');
    if (parts[parts.length-1].charAt(0) === '.')
        return self.sendForbidden_(req, res, path);
    fs.stat(path, function(err, stat) {
        if (err)
            return self.sendMissing_(req, res, path);
        if (stat.isDirectory())
            return self.sendDirectory_(req, res, path);
        return self.sendFile_(req, res, path);
    });
};

StaticServlet.prototype.sendError_ = function(req, res, error) {
  res.writeHead(500, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>Internal Server Error</title>\n');
  res.write('<h1>Internal Server Error</h1>');
  res.write('<pre>' + escapeHtml(sys.inspect(error)) + '</pre>');
    res.end();
  sys.puts('500 Internal Server Error');
  sys.puts(sys.inspect(error));
};

StaticServlet.prototype.sendMissing_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(404, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>404 Not Found</title>\n');
  res.write('<h1>Not Found</h1>');
  res.write(
    '<p>The requested URL ' +
    escapeHtml(path) +
    ' was not found on this server.</p>'
  );
  res.end();
  sys.puts('404 Not Found: ' + path);
};

StaticServlet.prototype.sendForbidden_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(403, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>403 Forbidden</title>\n');
  res.write('<h1>Forbidden</h1>');
  res.write(
    '<p>You do not have permission to access ' +
    escapeHtml(path) + ' on this server.</p>'
  );
  res.end();
  sys.puts('403 Forbidden: ' + path);
};

StaticServlet.prototype.sendRedirect_ = function(req, res, redirectUrl) {
  res.writeHead(301, {
      'Content-Type': 'text/html',
      'Location': redirectUrl
  });
  res.write('<!doctype html>\n');
  res.write('<title>301 Moved Permanently</title>\n');
  res.write('<h1>Moved Permanently</h1>');
  res.write(
    '<p>The document has moved <a href="' +
    redirectUrl +
    '">here</a>.</p>'
  );
  res.end();
  sys.puts('301 Moved Permanently: ' + redirectUrl);
};

StaticServlet.prototype.sendFile_ = function(req, res, path) {
  var self = this;
  var file = fs.createReadStream(path);
  var GMTdate = fs.statSync(path).mtime;
  sys.puts(GMTdate);
  
  res.writeHead(200, {
    'Content-Type': StaticServlet.
		    MimeMap[path.split('.').pop()] || 'text/plain',
		  'last-modified': GMTdate
  });
  if (req.method === 'HEAD') {
    res.end();
  } else {
    file.on('data', res.write.bind(res));
    file.on('close', function() {
      res.end();
    });
    file.on('error', function(error) {
      self.sendError_(req, res, error);
    });
  }
};

StaticServlet.prototype.sendDirectory_ = function(req, res, path) {
    var self = this;
    if (!options.dir) {
        return  self.sendForbidden_(req,res, path);
    }
    if (path.match(/[^\/]$/)) {
        req.url.pathname += '/';
            var redirectUrl = url.format(url.parse(url.format(req.url)));
        return self.sendRedirect_(req, res, redirectUrl);
    }
    fs.readdir(path, function(err, files) {
        if (err)
            return self.sendError_(req, res, err);

        if (!files.length)
            return self.writeDirectoryIndex_(req, res, path, []);

        var remaining = files.length;
        files.forEach(function(fileName, index) {
            fs.stat(path + '/' + fileName, function(err, stat) {
                if (err) {
                    // return self.sendError_(req, res, err);
                    files[index] = '-->' + fileName + '';
                }
                else if (stat.isDirectory()) {
                    files[index] = fileName + '/';
                }
                if (options.index && (fileName === 'index.html' ||
                                      fileName === 'index.htm')) {
                    sys.puts('Sending index.html and not the directory!!! ') ;
                    return self.sendFile_(req, res, path + '/' + fileName);   
                }
                if (!(--remaining))
                    return self.writeDirectoryIndex_(req, res, path, files);
            });
        });
    });
};

StaticServlet.prototype.writeDirectoryIndex_ = function(req, res, path, files) {
  path = path.substring(1);
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.write('<!doctype html>\n');
  res.write('<title>' + escapeHtml(path) + '</title>\n');
  res.write('<style>\n');
  res.write('  ol { list-style-type: none; font-size: 1.2em; }\n');
  res.write('</style>\n');
  res.write('<h1>Directory: ' + escapeHtml(path) + '</h1>');
  res.write('<ol>');
  files.forEach(function(fileName) {
    if (fileName.charAt(0) !== '.') {
      res.write('<li><a href="' +
        escapeHtml(fileName) + '">' +
        escapeHtml(fileName) + '</a></li>');
    }
  });
  res.write('</ol>');
  res.end();
};

process.on('uncaughtException', function(e) {
    sys.log(e.stack);
});


exports.createServer = function (someOptions) {
    sys.puts(someOptions.index);
    var server = new HttpServer({
        'GET': createServlet(StaticServlet),
        'HEAD': createServlet(StaticServlet)
    });
    var result = server.server;
    
    options = someOptions || {};

    if (!options.root) {
        try {
            fs.lstatSync('./public');
            options.root = './public';
        }
        catch (err) {
            options.root = './';
        }
    }
    result.root = options.root;
  
    // if (options.headers) {
    //     result.headers = options.headers; 
    // }

    // result.cache = options.cache || 3600; // in seconds.
    // result.autoIndex = options.autoIndex !== false;

    // if (options.ext) {
    //     result.ext = options.ext === true ? 'html' : options.ext;
    // }
    return result;
};
