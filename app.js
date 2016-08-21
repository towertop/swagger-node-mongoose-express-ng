'use strict';

/*
  Execution
  For development? `$env:DEBUG="pipes*,swagger-tools:middleware:*"` or `export DEBUG="pipes*,swagger-tools:middleware:*"`, and commands recommended below
  For production? `$env:NODE_ENV="production"` or `export NODE_ENV="production"` , and `node app.js`
*/
var path = require('path');
var fs = require('fs');

var mongoose = require('mongoose');
var yaml = require('js-yaml');
var swaggerMongoose = require('swagger-mongoose');

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

/*
  ODM
  swagger-mongoose + mongoose
  How to use its "Vender Extension" in swagger schema? https://github.com/simonguest/swagger-mongoose
  How to 
*/
// #Caveat: Keep hardcoded location of swagger api spec here.
var swaggerFile = config.swaggerFile || path.resolve(config.appRoot, 'api/swagger/swagger.yaml');
var swaggerString = fs.readFileSync(swaggerFile, 'utf8');
// #Caveat: Used in api/fittings/swagger_mongoose.js , forwared to req.mongooseModels . Thanks to node-config!
nodeConfig.mongooseModels = swaggerMongoose.compile(yaml.safeLoad(swaggerString)).models;

/*
  API
  How to use its "Vender Extension" in swagger schema? https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md
  How to write controllers? 
    What swagger-metadata add in req.swagger? https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-20
    What swagger-router add in req.swagger? https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#reqswagger-2
    Express API? http://expressjs.com/en/4x/api.html
    with augmentation below:
      req.mongooseModels
  How to modify config? (Rarely) https://github.com/swagger-api/swagger-node/blob/master/docs/configuration.md
*/
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  // if (swaggerExpress.runner.swagger.paths['/hello']) {
  //   console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  // }
  console.log('API: http://127.0.0.1:' + port + '/api');
  console.log('SPAs: http://127.0.0.1:' + port + '/app');
  console.log('Enjoy and good luck ~');
});

/*
  SPA
*/
app.use('/app', express.static(__dirname + '/public'));
if (nodeConfig.util.getEnv('NODE_ENV') === 'development') {
  // console.log('Setup /bower_components for local development');
  app.use('/bower_components', express.static(__dirname + '/bower_components'));
}

/*
  API Development
  Use command 'swagger project start'
  Use command 'swagger project edit'
*/