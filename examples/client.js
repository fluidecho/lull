var lull = require('./../');		// require('lull')


// make a client request to the lull web service.
console.log('request');
var options = {
	hostname: '127.0.0.1',
	port: 5555,
	path: '/foo/bar/?hello=world',
	method: 'POST',
  headers: {
		'Content-Type': 'application/json; charset=utf-8',		// json formatted data.
 	}	
};

var req = lull.request(options, function(message) {
 
	console.log('message received: ' + require('util').inspect(message, true, 99, true));

});


req.write('{"foo":"bar","x":982750}');		// sending json formatted data.
req.end();
