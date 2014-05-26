var lull = require('./../');    // require('lull')
var preview = require('preview')('service');

//
// Example API:-
// ---------------------------------------------------------------------------------------------
// | Function       | Method  | path[0]   | path[1]     | Example Request | Comment
// ---------------------------------------------------------------------------------------------
// | apiService     | GET     | /         | N/A         | /               | Returns var api.
// | getFoos        | GET     | foo       | N/A         | /foo/           | Get all foos.
// | newFoo         | POST    | foo       | <foo name>  | /foo/bar/       |
// | getFoo         | GET     | foo       | <foo name>  | /foo/bar/       |
// | updateFoo      | PUT     | foo       | <foo name>  | /foo/bar/       |
// | deleteFoo      | DELETE  | foo       | <foo name>  | /foo/bar/       |
// | helloWorld     | GET     | hello     | world       | /hello/world/   | Both paths literal.
// ---------------------------------------------------------------------------------------------
// <plaeholder value>, otherwise literals. Can add as many paths as want.
//
// api map:
var api = [
  {
    name: 'apiService',    
    method: 'GET',
    path: []
  },
  {
    name: 'getFoos',
    method: 'GET',
    path: ['foo']
  },
  {
    name: 'newFoo',
    method: 'POST',
    path: ['foo', '']
  },
  {
    name: 'getFoo',
    method: 'GET',
    path: ['foo', '']
  },
  {
    name: 'updateFoo',
    method: 'PUT',
    path: ['foo', '']
  },
  {
    name: 'deleteFoo',
    method: 'DELETE',
    path: ['foo', '']
  },
  {
    name: 'helloWorld',
    method: 'GET',
    path: ['hello', 'world']
  }
];


// exmple api foo app object, which gets manipulated by the web service requests.
var foo = [];


var options = {
  host: '127.0.0.1',
  port: 5555,
  secure: false,      // true = https, else http. if true set: key, cert and apikey.
  key: '',
  cert: '',
  apikey: '',         // if secure true, this is matched 'authenticated' with client request.
  access_hosts: [],   // can limit client request access to these hosts (ip), otherwise allow any.
  api: api            // array mapping requests to js functions.
};                    // other settings: content_type, server.


lull.createService(options, function(req, res) {
  preview('lull request.');

  // returns: req.api{name, method, path[], properties{}}
  preview('req.api', req.api);
  
  // example api foo app:
  switch ( req.api.name ) {

    // example request GET: http://127.0.0.1:5555
    case 'apiService':
      preview('apiService called ->');
      res.end(JSON.stringify(api));
      break;

    // example request GET: http://127.0.0.1:5555/foo/
    case 'getFoos':
      preview('getFoos called ->');
      res.write(JSON.stringify({'foo':foo}));   // wraped in 'foo' object so easier to understand foo array.
      res.end();
      break;

    // example request POST: http://127.0.0.1:5555/foo/bar/
    case 'newFoo':
      preview('newFoo called ->');
      foo.push({name: req.api.path[1], properties: {data: req.api.properties.data, query: req.api.properties.query} });
      res.write(JSON.stringify(foo[foo.length -1]));    // echo the received data.
      res.end();
      break;

    // example request GET: http://127.0.0.1:5555/foo/bar/
    case 'getFoo':
      preview('getFoo called ->');
      preview('req.api.path[1]', req.api.path[1]);
      for ( var bar in foo ) {
        preview('foo[bar]', foo[bar]);
        if ( foo[bar].name === req.api.path[1] ) {
          res.write(JSON.stringify(foo[bar]));
          res.end();        
        }
      }
      break;

    // example request PUT: http://127.0.0.1:5555/foo/bar/
    case 'updateFoo':
      preview('updateFoo called ->');
      for ( var bar in foo ) {
        if ( foo[bar].name === req.api.path[1] ) {
          // update this
          foo[bar] = {name: req.api.path[1], properties: {data: req.api.properties.data, query: req.api.properties.query} };
          res.write(JSON.stringify(foo[bar]));
          res.end();        
        }
      }     
      break;

    // example request DELETE: http://127.0.0.1:5555/foo/bar/
    case 'deleteFoo':
      preview('deleteFoo called ->');
      for ( var bar in foo ) {
        if ( foo[bar].name === req.api.path[1] ) {
          // delete this
          foo.splice(bar, 1);
          res.write('{}');
          res.end();        
        }
      }
      break;

    // example request GET: http://127.0.0.1:5555/hello/world/
    case 'helloWorld':
      preview('helloWorld called ->');
      res.end('{"hello":"world"}');
      break;

  };
  
  try {
    res.end('{"foo":"nada"}');    // if none.
  } catch(e) {
  }
  preview('FOO', 'foo', foo);

});
console.log('lull web service running at: ' + options.host + ':' + options.port);

