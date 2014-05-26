var lull = require('./../');		// require('lull')
var preview = require('preview')('client');		// use: node client.js --preview

// make a client request to the lull web service.
preview('request');
var options = {
	secure: false,
	rejectUnauthorized: false,		// false if server (bind) is using a self signed cert.
	requestCert: true,	
	apikey: '',	
	hostname: '127.0.0.1',
	port: 5555,
	path: '/foo/bar/?hello=world',
	method: 'POST',
  headers: {
		'Content-Type': 'application/json; charset=utf-8',		// json formatted data.
 	}	
};

var req = lull.request(options, function(message) {
 
	preview('message received', message);

});


req.write('{"foo":"bar","x":1}');		// sending json formatted data.
req.end();
