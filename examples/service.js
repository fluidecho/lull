var lull = require('./../');		// require('lull')
var util = require('util');

//
// Example API:-
// ---------------------------------------------------------------------------------------------
// | Function 			| Method 	| path[0]  	| path[1]			| Example Request	|	Comment
// ---------------------------------------------------------------------------------------------
// | apiService			| GET			| /					| N/A					|	/					 			| Returns var api.
// | getFoos	  		| GET			| foo	   		| N/A					|	/foo/						|	Get all foos.
// | newFoo					| POST		| foo	 			| <foo name>	|	/foo/bar/				|
// | getFoo	  			| GET		 	| foo	   		| <foo name>	|	/foo/bar/				|
// | updateFoo	 		| PUT			| foo	 			| <foo name>	|	/foo/bar/				|
// | deleteFoo	 		| DELETE 	| foo	 			| <foo name>	|	/foo/bar/				|
// | helloWorld			| GET		 	| hello			| world				|	/hello/world/		| Both paths literal.
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
	secure: false,			// true = https, else http. if true set: key, cert and apikey.
	key: '',
	cert: '',
	apikey: '',					// can generate with: respite.generateApikey();  // or from console: respite --generateapikey  // store this apikey somewhere safe.
	access_hosts: [],		// can limit client request access to these hosts (ip), otherwise allow any.
	api: api						// array mapping requests to js functions.
};										// other settings: content_type, server.


lull.createService(options, function(req, rep) {
	console.log('lull request.');

	// returns: req.api{name, method, path[], properties{}}
	console.log('req.api: ' + util.inspect(req.api, true, 99, true));
	
	// example api foo app:
	switch ( req.api.name ) {

		// example request GET: http://127.0.0.1:5555
		case 'apiService':
			console.log('apiService called ->');
			rep.end(JSON.stringify(api));
			break;

		// example request GET: http://127.0.0.1:5555/foo/
		case 'getFoos':
			console.log('getFoos called ->');
			rep.write(JSON.stringify({'foo':foo}));		// wraped in 'foo' object so easier to understand foo array.
			rep.end();
			break;

		// example request POST: http://127.0.0.1:5555/foo/bar/
		case 'newFoo':
			console.log('newFoo called ->');
			foo.push({name: req.api.path[1], properties: req.api.properties});	// TODO: foo properties!
			rep.write(JSON.stringify(foo[foo.length -1]));
			rep.end();
			break;

		// example request GET: http://127.0.0.1:5555/foo/bar/
		case 'getFoo':
			console.log('getFoo called ->');
			for ( var bar in foo ) {
				if ( foo[bar] === req.api.path[1] ) {
					rep.write(JSON.stringify(foo[bar]));
					rep.end();				
				}
			}
			break;

		// example request PUT: http://127.0.0.1:5555/foo/bar/
		case 'updateFoo':
			console.log('updateFoo called ->');
			rep.write('hello from updateFoo\n');
			rep.end();
			break;

		// example request DELETE: http://127.0.0.1:5555/foo/bar/
		case 'deleteFoo':
			console.log('deleteFoo called ->');
			rep.write('hello from deleteFoo\n');
			rep.end();
			break;

		// example request GET: http://127.0.0.1:5555/hello/world/
		case 'helloWorld':
			console.log('helloWorld called ->');
			rep.end('{"hello":"world"}');
			break;

	};

});
console.log('lull web service running at: ' + options.host + ':' + options.port);

