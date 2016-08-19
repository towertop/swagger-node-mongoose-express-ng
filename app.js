'use strict';

/*
	Execution
	For development? `$env:DEBUG="pipes*,swagger-tools:middleware:*"` or `export DEBUG="pipes*,swagger-tools:middleware:*"`, and commands recommended below
	For production? `$env:NODE_ENV="production"` or `export NODE_ENV="production"` , and `node app.js`
*/
var path = require('path');
var fs = require('fs');

var mongoose = require('mongoose');

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

/*
	Configuration
	Keep swagger-node's configuration. And append more here too.
*/
// #Caveat: Load from this module's directory forcelly rather than default the process cwd.
if (!process.env.NODE_CONFIG_DIR) {
  if (config.configDir) {
    process.env.NODE_CONFIG_DIR = path.resolve(config.appRoot, config.configDir);
  } else {
    process.env.NODE_CONFIG_DIR = path.resolve(config.appRoot, 'config');
  }
}
var nodeConfig = require('config');

/*
	Persistance
	mongoose + mongodb
	Mongoose Guide - Queries? http://mongoosejs.com/docs/queries.html
	Mongodb Guide - Queries? https://docs.mongodb.com/manual/tutorial/query-documents/
	Mongoose Guide - Updating? http://mongoosejs.com/docs/documents.html
	Mongoose API? http://mongoosejs.com/docs/api.html
*/
// #Caveat: Cannot use nodeConfig.get method, for following assignments to config.swagger in swagger-node-runner
mongoose.connect(nodeConfig.mongo.uri, nodeConfig.mongo.options, function (err) {
  // Log Error
  if (err) {
    throw err;
  } else {
    // Enabling mongoose debug mode if required
    mongoose.set('debug', nodeConfig.mongo.debug);
  }
});


SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});

/*
	API Development
	Use command 'swagger project start'
	Use command 'swagger project edit'
*/