'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'super_secreta';


exports.ensureAuth = function(req, res, next ){
    var params = req.body;
    var substring = params.commands.split(" ");
    var string = substring[0].toLowerCase()

    if (!req.headers.authorization) {
        if (string === "register") {
            next();
        } else if (string === "login") {
            next();
        } else {
            return res.status(403).send({ message: "La peticion no esta autorizada" });
        }
    } else {
        var token = req.headers.authorization.replace(/['"]+/g, "");

        try {
            var payload = jwt.decode(token, key);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: "El token ha expirado" });
            }
        } catch (error) {
            return res.status(404).send({ message: "El token no es válido" });
        }

        req.user = payload;
        next();
    }
};
