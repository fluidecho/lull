var lull = require('./../');		// require('lull')


// set foo value:
var FOO = 'bar7';

// make a client request to the lull api.
console.log('request');
var options = {
	hostname: '127.0.0.1',
	port: 5555,
	path: '/foo/' + FOO + '/?hello=world#hashstring',
	method: 'POST',
  headers: {
		'Content-Type': 'application/json; charset=utf-8',		// posting json formatted data.
 	}	
};

var req = lull.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log(JSON.parse(chunk));
  }); 
  
	// add lull 'message' event after all buffering and paring on chunks is complete:
	res.on('message', function (message) {
    console.log('message: ' + require('util').inspect(message, true, 99, true));
  });  
  
  
  
});


req.write('{"foo":"bar","x":982750}');
//req.write('name1=value1&name2=value2');
//req.write('data2\n');
req.end();
