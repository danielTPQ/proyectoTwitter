'use strict'

var express = require('express');
var twitterController = require('../controller/twitter.controller');
var api = express();
var middleWareAuth = require('../middlewares/authenticated');

api.post('', middleWareAuth.ensureAuth, twitterController.commands);

module.exports = api;

