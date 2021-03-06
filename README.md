# Lull

Simple RESTful Web Service, written for node.js.  

## Installation

From your terminal, requires [node.js](http://nodejs.org/).

```
npm install lull
```

## Example web service
For more, see _examples_ folder.
```js
var lull = require('lull');

//
// Example API:-
// ------------------------------------------------------------------------------------------
// | Function     | Method  | path[0]   | path[1]   | Request         | Comment             |
// ------------------------------------------------------------------------------------------
// | helloWorld   | GET     | hello     | world     | /hello/world/   | Both paths literal. |
// ------------------------------------------------------------------------------------------
// path: can be literal: 'hello' or placeholder: '', can set many path items.
// api map:
var api = [
  {
    name: 'helloWorld',
    method: 'GET',
    path: ['hello', 'world']
  }
];

var options = {
  host: '127.0.0.1',
  port: 5555,
  secure: false,    // true = https, else http. if true set: key, cert and apikey.
  key: '',
  cert: '',
  apikey: '',
  api: api          // array mapping requests to js functions.
};

lull.createService(options, function(req, rep) {
  switch ( req.api.name ) {

    // example request GET: http://127.0.0.1:5555/hello/world/
    case 'helloWorld':
      console.log('helloWorld function called ->');   // req.api = {name, method, path[], properties{}}.
      rep.end(JSON.stringify({req.api.path[0]:req.api.path[1]});    // returns: {"hello":"world"}
      break;

  };
});
console.log('lull web service running at: ' + options.host + ':' + options.port);
```

## Example client
```js
var lull = require('lull');

// make a client request to the lull web service.
console.log('request');
var options = {
  hostname: '127.0.0.1',
  port: 5555,
  path: '/foo/bar/?hello=world',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',    // json formatted data.
  } 
};

var req = lull.request(options, function(message) {
  console.log('message received: ' + require('util').inspect(message, true, 99, true));
});

req.write('{"foo":"bar","x":982750}');    // sending json formatted data.
req.end();
```

## License

Choose either: [MIT](http://opensource.org/licenses/MIT) or [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).

