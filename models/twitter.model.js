'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var twitterSchema = Schema({
    Dog: String
});

module.exports = mongoose.model('twitter', twitterSchema);