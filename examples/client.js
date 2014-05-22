var lull = require('./../');		// require('lull')


// set foo value:
var FOO = 'bar7';

// make a client request to the lull api.
console.log('request');
var options = {
	hostname: '127.0.0.1',
	port: 5555,
	path: '/foo/' + FOO + '/',
	method: 'POST'
};

lull.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log(JSON.parse(chunk));
  }); 
});



