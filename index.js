'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3300;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1:27017/hospital2018171', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(()=>{
    console.log('Conexión a la base de datos correctamente');
    app.listen(port, ()=>{
        console.log('Servidor de express corriendo');
    });
}).catch(err =>{
    console.log('Error al conectarse a la base de datos', err);
});