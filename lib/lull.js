"use strict";
//
// Lull: A Simple RESTful Web Service.
//
// Version: 0.0.1
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2014 Mark W. B. Ashcroft.
// Copyright (c) 2014 Kurunt.
//


//var events = require('events');
var util 		= require('util');					// debugging.
var fs 			= require('fs');						// for reading https key and cert.
var crypto 	= require('crypto');				// for generating apikeys.
var url			= require('url');


// Lull Server.
exports.createService  = createService;
function createService(options, cb) {

	if ( options.secure ) {
		var http = require('https');
	} else {
		var http = require('http');
	}


	// handle requests.
	function onRequest(req, res) {
	
		console.log('client connected');
	
		// if client request favicon return.
		if (req.url === '/favicon.ico') {
		  res.writeHead(200, {'Content-Type': 'image/x-icon'} );
		  res.end();
		  return;
		}
		
		
		// TODO: if secure, authenticate clients' apikey with options.apikey.
		
		
		// map request to api:
		req.name = options.api[0].name;
		
		var reqObj = url.parse(req.url);
		console.log('reqObj: ' + util.inspect(reqObj, true, 99, true));

		var path = [];
		var ps = reqObj.pathname.split('/');
		for ( var p in  ps ) {
			if ( ps[p].trim() != '' || ps[p] === undefined ) {
				path.push(ps[p]);
			}
		}
		
		console.log('path: ' + util.inspect(path, true, 99, true));
		console.log('http method: ' + req.method);
		
		//console.log('namespace: ' + util.inspect(path[0], true, 99, true));
		//console.log('object: ' + util.inspect(path[1], true, 99, true));
		var notFound = true;
		var a = 0;
		for ( a = 0; a < options.api.length; a++ ) {
			console.log('api name: ' + options.api[a].name);
			console.log('options.api[a]: ' + util.inspect(options.api[a], true, 99, true));
			//console.log('options.api[a].path.length: ' + options.api[a].path.length);
			
			if ( options.api[a].path.length === path.length ) {
			
				if ( options.api[a].path.length === 0 && path.length === 0 ) {
					console.log('this path matches at x: ' + x);
					console.log('root level, this is the api request!: ' + options.api[a].name);
					req.api = cloneObj(options.api[a]);		// must clone object!
					req.api.name = options.api[a].name;
					notFound = false;
					a = options.api.length;	// break outer for loop.				
				} else {
			
					for ( var x in options.api[a].path ) {
						console.log('options.api[a].path: ' + options.api[a].path[x] + ' path[x]: ' + path[x]);
						if ( 
									(options.api[a].method === req.method) &&
							 		((path[x] === options.api[a].path[x]) || (options.api[a].path[x] === ''))
								) {
							
							console.log('this path matches at x: ' + x);
							
							if ( Number(x) === options.api[a].path.length - 1 ) {
								console.log('this is the api request!: ' + options.api[a].name);
								req.api = cloneObj(options.api[a]);		// must clone object!
								req.api.name = options.api[a].name;
								req.api.path = path;
								notFound = false;
								a = options.api.length;	// break outer for loop.
							}

						} else {
							console.log('fail to match this path value to api path');
							break;
						}
					}
				
				}
				
			}
		}


		if ( notFound ) {
			res.writeHead(400, {'Server': 'Respite', 'Content-Type': 'application/json; charset=utf-8', 'Connection': 'closed'});
			res.end(JSON.stringify({code: 400, status: 'not valid api request'}));
			return;		
		}


		// TODO:
				// get body and set in properties.
				// set query as properties also.

		// send header, body should be in json by default.
		if ( options.content_type === undefined ) {
			options.content_type = 'application/json; charset=utf-8';
		}
		if ( options.server === undefined ) {
			options.server = 'Lull';
		}		
		res.writeHead(200, {'Content-Type': options.content_type, 'Server': options.server});
		
		// is valid api, return control of api request back to program.
		return cb(req, res);		
		
	}
	

	// can generate own keys using OpenSSL, see: http://nodejs.org/api/tls.html
	if ( options.secure ) {
		var server = http.createServer({ key: fs.readFileSync(options.key), cert: fs.readFileSync(options.cert) }, onRequest).listen(options.port);
	} else {
		var server = http.createServer(onRequest).listen(options.port);
	}

	
}





// Lull Request.
exports.request  = request;
function request(options, cb) {
	//options = {hostname, port, path, method, secure}
	
	console.log('Lull request');
	console.log('options: ' + util.inspect(options, true, 99, true));
	
	if ( options.secure ) {
		var http = require('https');
	} else {
		var http = require('http');
	}
	
	var req = http.request(options, function(res) {
	
		return cb(res);
	
		console.log('lull STATUS: ' + res.statusCode);
		console.log('lull HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
		  console.log('lull BODY: ' + chunk);
		  return cb(true);
		});
	});
	
	//req.write('data\n');
	req.end();		// makes the call.
	
}



function cloneObj(obj) {
	// quick and dirty!
	return JSON.parse(JSON.stringify(obj));
}






// APIKEY
function generateApikey() {
	var len = 32;							// using 32 bytes = 256 bit key.
	return crypto.randomBytes(Math.ceil(len * 3 / 4))
		.toString('base64')   	// buffer to base64.
		.slice(0, len)        	// trim length.
		.replace(/\+/g, '0')  	// make url friendly.
		.replace(/\//g, '0'); 	// make url friendly.
}
exports.generateApikey = generateApikey;

// generate apikey from console:
// using minimist> respite --generateapikey		// tzmOhgFhpWHvFJu0TRW40wL3J6WAQ0Y0




/*
var apikey = generateApikey();
var bytes = Buffer.byteLength(apikey, 'utf8');

console.log('apikey: ' + apikey + ' = ' + apikey.length + ' characters, ' + bytes + ' bytes or ' + bytes * 8 + ' bits.');

var base = new Buffer('master:'+apikey).toString('base64');		// basic authentication friendly.
console.log('base: ' + base);

var back = new Buffer(base, 'base64').toString();				// decode back to origional apikey.
console.log('back: ' + back);

*/


//util.inherits(createServer, events.EventEmitter);
	//var self = this;
	//function Server() {
	//	self = this;
	//}
	//util.inherits(Server, events.EventEmitter);



		//res.write('hello from beekeeper\n');
		//options.api.requests[0].fn({}, res);
		
		//self.emit('request', options.api.requests[0].fn, 'GET', '', '', '', res);		//(fn, action, method, object, properties, response)
		
		//function() { console.log('htllo world'); }
//return cb(new Server);

