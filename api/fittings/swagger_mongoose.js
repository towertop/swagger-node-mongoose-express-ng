'use strict';

var nodeConfig = require('config');

module.exports = function create(fittingDef, bagpipes) {
   
  if (!nodeConfig.mongooseModels) {
    throw new Error('Failed to put req.mongooseModels');
  }

  return function swagger_mongoose(context, next) {
    context.request.mongooseModels = nodeConfig.mongooseModels;

    next();
  }
};