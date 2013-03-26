
var https = require('https');
var fs = require('fs');

var options = {
  // key: fs.readFileSync('privatekey.pem'),
  // cert: fs.readFileSync('certificate.pem')
    
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

var a = https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(5000);


