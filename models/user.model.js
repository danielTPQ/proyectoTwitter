'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    role: String
});

module.exports = mongoose.model('user', userSchema);