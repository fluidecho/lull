"use strict";
//
// Lull: A Simple RESTful Web Service.
//
// Version: 0.0.3
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2014 Mark W. B. Ashcroft.
// Copyright (c) 2014 Kurunt.
//


var preview			= require('preview')('lull');
var fs          = require('fs');        // for reading https key and cert.
var url         = require('url');
var querystring = require('querystring');


preview('lull starting');


// Lull Server.
exports.createService  = createService;
function createService(options, cb) {

  // options: encoding, content_type, server, access_host, secure, etc.

  if ( options.secure ) {
    var http = require('https');
  } else {
    var http = require('http');
  }
  
  // set default options.
  if ( options.content_type === undefined ) {
    options.content_type = 'application/json; charset=utf-8';   // send header, body should be in json by default.
  }
  if ( options.server === undefined ) {
    options.server = 'Lull';
  }   
  if ( options.encoding === undefined ) {
    options.encoding = 'utf8';    // default encoding utf8.
  }     
  if ( options.access_hosts === undefined ) {
    options.access_hosts = [];    // allow any host.
  }   


  // handle requests.
  function onRequest(req, res) {
  
    preview('onRequest', 'client onRequest');
    
    // if secure connection, make sure client is using valid apikey.
    if ( options.secure ) {
			var header = req.headers['authorization']||'',        // get the header
		  	token = header.split(/\s+/).pop()||'',            	// and the encoded auth token
		    auth = new Buffer(token, 'base64').toString(),    	// convert from base64
		    parts = auth.split(/:/),                          	// split on colon
		    username = parts[0],	
		    apikey = parts[1]; 
		    if ( apikey != options.apikey ) {
		    	preview('onRequest', 'request client, not using valid apikey!');
        	res.writeHead(403, {'Server': options.server, 'Content-Type': 'application/json; charset=utf-8', 'Connection': 'closed'});
        	res.end(JSON.stringify({code: 403, status: 'unauthorized request, invalid apikey'}));
        	return;   		    
		    }
    }
    

    // if not valid access_host, respond 403.
    if ( options.access_hosts.length > 0 ) {
      var client_host = _ipAddress(req);
      preview('clients ip address: ' + client_host); 
      var allowed = false;
      for ( var a in access_hosts ) {
        if ( client_host === access_hosts[a] ) {      // allowed host.
          allowed = true;
          break;
        }
      }
      if ( !allowed ) {
      	preview('onRequest', 'request client, not using valid access host!');
        res.writeHead(403, {'Server': options.server, 'Content-Type': 'application/json; charset=utf-8', 'Connection': 'closed'});
        res.end(JSON.stringify({code: 403, status: 'unauthorized request, invalid host'}));
        return;   
      }     
    } 
  
  
    // if client request favicon return.
    if (req.url === '/favicon.ico') {
      res.writeHead(200, {'Content-Type': 'image/x-icon'} );
      res.end();
      return;
    }
    
  
    // map request to api:
    req.name = options.api[0].name;
    
    var reqObj = url.parse(req.url);
   // console.log('reqObj: ' + util.inspect(reqObj, true, 99, true));
    preview('onRequest', 'reqObj', reqObj);

    var path = [];
    var ps = reqObj.pathname.split('/');
    for ( var p in  ps ) {
      if ( ps[p].trim() != '' || ps[p] === undefined ) {
        path.push(ps[p]);
      }
    }
    

    preview('onRequest', 'path', path);
    preview('onRequest', 'http method: ' + req.method);
    
    var notFound = true;
    var a = 0;
    for ( a = 0; a < options.api.length; a++ ) {
      preview('onRequest', 'api name: ' + options.api[a].name);
      preview('onRequest', 'options.api[a]', options.api[a]);
      
      if ( options.api[a].path.length === path.length ) {
      
        if ( options.api[a].path.length === 0 && path.length === 0 ) {
          preview('onRequest', 'this path matches at x: ' + x);
          preview('onRequest', 'root level, this is the api request!: ' + options.api[a].name);
          req.api = cloneObj(options.api[a]);   // must clone object!
          req.api.name = options.api[a].name;
          notFound = false;
          a = options.api.length; // break outer for loop.        
        } else {
      
          for ( var x in options.api[a].path ) {
            preview('onRequest', 'options.api[a].path: ' + options.api[a].path[x] + ' path[x]: ' + path[x]);
            if ( 
                  (options.api[a].method === req.method) &&
                  ((path[x] === options.api[a].path[x]) || (options.api[a].path[x] === ''))
                ) {
              
              preview('onRequest', 'this path matches at x: ' + x);
              
              if ( Number(x) === options.api[a].path.length - 1 ) {
                preview('onRequest', 'this is the api request!: ' + options.api[a].name);
                req.api = cloneObj(options.api[a]);   // must clone object!
                req.api.name = options.api[a].name;
                req.api.path = path;
                notFound = false;
                a = options.api.length; // break outer for loop.
              }

            } else {
              preview('onRequest', 'fail to match this path value to api path');
              break;
            }
          }
        
        }
        
      }
    }


    // if no valid api found, respond 400.
    if ( notFound ) {
      res.writeHead(400, {'Server': options.server, 'Content-Type': 'application/json; charset=utf-8', 'Connection': 'closed'});
      res.end(JSON.stringify({code: 400, status: 'not valid api request'}));
      return;   
    }


    req.api.properties = {};
    req.api.properties.query = querystring.parse(reqObj.query);
    
    if ( req.method === 'POST' || req.method === 'PUT' ) {
    
      var buffer = new Buffer(0);   // concat until message chunks complete buffering.
    
      // on chunk concate buffer.
      req.on('data', function (chunk) {
        preview('onRequest', 'body chunk: ' +  chunk.toString());
        buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);  
      });     

      req.on('end', function() {
        var body = new Buffer(buffer.length);
        buffer.copy(body);    // body now clone of buffer.
        buffer = null;        // reset buffer.
        preview('end', 'body ended! body:' + body.toString());
        preview('body', body);
        req.api.properties.body = body;
        try {
        
          // if header request set json as format:
          preview('content-type: ' + req.headers['content-type'].toString());
          if ( req.headers['content-type'] != undefined ) {
            if ( req.headers['content-type'].toString().indexOf('/json') > 0 ) {
              preview('JSON parse this body: ' + body.toString(options.encoding));
              req.api.properties.data = JSON.parse(body.toString(options.encoding).trim());
            }
          }
          
          if ( req.api.properties.data === undefined ) {
            req.api.properties.data = querystring.parse(body.toString(options.encoding));
          }
          
        } catch(e) {
          // body not parse-able.
        }
        returnControl();
      }); 
      
    } else {
      returnControl();
    }
        
        
    function returnControl() {
      // respond header.
      res.writeHead(200, {'Content-Type': options.content_type, 'Server': options.server});
    
      // is valid api, return control of api request back to program.
      return cb(req, res);    
    }       


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
  
  preview('Lull request');
  preview('options', options);
  
  if ( options.secure ) {
    var http = require('https');
    
    // set auth from apikey:
    options.auth = 'client:' + options.apikey;
    
    
  } else {
    var http = require('http');
  }
  
  var req = http.request(options, function(res) {
    

    var buffer = new Buffer(0);   // concat until message chunks complete buffering.
    
    // on chunk concate buffer.
    res.on('data', function (chunk) {
      preview('request', 'body chunk: ' +  chunk.toString());
      buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);  
    });     

    res.on('end', function() {
      var body = new Buffer(buffer.length);
      buffer.copy(body);    // body now clone of buffer.
      buffer = null;        // reset buffer.
      preview('body ended! body:' + body.toString());
      preview('body', body);
      var message = {};
      message.code = res.statusCode;
      message.headers = {content_type: res.headers['content-type']};
      message.body = body;
      
      try {
        
        // if header request set json as format:
        preview('content-type: ' + res.headers['content-type'].toString());
        if ( res.headers['content-type'] != undefined ) {
          if ( res.headers['content-type'].toString().indexOf('/json') > 0 ) {
            preview('JSON parse this body: ' + body.toString(options.encoding));
            message.data = JSON.parse(body.toString(options.encoding).trim());
          }
        }
          
        if ( message.data === undefined ) {
          message.data = querystring.parse(body.toString(options.encoding));
        }
          
      } catch(e) {
        // body not parse-able.
      }     
      
      
      return cb(message);
      
    }); 

  });
  
  
  return req;
  
}



function cloneObj(obj) {
  // quick and dirty!
  return JSON.parse(JSON.stringify(obj));
}



function _ipAddress(request) { 
	return (request.headers['x-forwarded-for'] || '').split(',')[0] 
		|| request.connection.remoteAddress 
		|| request.socket.remoteAddress;
}

