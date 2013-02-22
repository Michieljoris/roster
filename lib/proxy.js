#!/usr/local/bin/node

var sys = require('sys');
var http = require('http');
var url = require('url');

var PREFIX = '/db/';
// var TARGET = 'http://example.cloudant.com';
var TARGET = 'http://aws:5984';
var PORT = 8001;

function error(response, error, reason, code) {
    sys.log('Error '+code+': '+error+' ('+reason+').');
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({ error: error, reason: reason }));
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
    headers['host'] = uri.hostname + ':' + (uri.port||80);
    headers['x-forwarded-for'] = inRequest.connection.remoteAddress;
    headers['referer'] = 'http://' + uri.hostname + ':' + (uri.port||80) + '/';

    var outRequest = out.request(inRequest.method, path, headers);

    out.on('error', function(e) { unknownError(inResponse, e) });
    outRequest.on('error', function(e) { unknownError(inResponse, e) });

    inRequest.on('data', function(chunk) { outRequest.write(chunk) });
    inRequest.on('end', function() {
        outRequest.on('response', function(outResponse) {
            // nginx does not support chunked transfers for proxied requests
            delete outResponse.headers['transfer-encoding'];

            if (outResponse.statusCode == 503) {
                return error(inResponse, 'db_unavailable', 'Database server not available.', 502);
            }

            inResponse.writeHead(outResponse.statusCode, outResponse.headers);
            outResponse.on('data', function(chunk) { inResponse.write(chunk); });
            outResponse.on('end', function() { inResponse.end(); });
        });
        outRequest.end();
    });
};

function handleRequest(request, response) {
    var u = url.parse(request.url);

    // Only serve URLs that start with PREFIX
    if (u.pathname.substring(0, PREFIX.length) != PREFIX) return error(response, 'not_found', 'Nothing found here.', 404);

    u = TARGET + u.pathname.substring(PREFIX.length-1) + (u.search||'');
    forwardRequest(request, response, u);
}

process.on('uncaughtException', function(e) {
    sys.log(e.stack);
});

http.createServer(handleRequest).listen(PORT);

sys.puts('Proxy ready on port '+PORT+'.')
