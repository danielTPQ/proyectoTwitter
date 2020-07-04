'use strict'

var User = require('../models/user.model');
var Tweet = require('../models/twitter.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var auth = require('../middlewares/authenticated');


function commands(req, res) {
    var user = new User();
    var tweet = new Tweet();
    var params = req.body;
    var userData = Object.values(params); 
    var resp = userData.toString().split(" ");


        if (resp[0] == 'register') {
            if (resp[1] != null && resp[2] != null && resp[3] != null && resp[4] != null) {
                User.findOne({ $or: [{ email: resp[2] }, { username: resp[3] }] }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el servidor' });
                    } else if (userFind) {
                        res.send({ message: 'Este usuario o correo ya está utilizado' });
                    } else {
                        user.name = resp[1];
                        user.email = resp[2];
                        user.username = resp[3];
                        user.password = resp[4];

                        bcrypt.hash(resp[4], null, null, (err, hashPass) => {
                            if (err) {
                                res.status(500).send({ message: 'Error de encriptación' });
                            } else {
                                user.password = hashPass;

                                user.save((err, userSaved) => {
                                    if (err) {
                                        res.status(500).send({ message: 'Error en el servidor' });
                                    } else if (userSaved) {
                                        res.send({ user: userSaved })
                                    } else {
                                        res.status(404).send({ message: 'Erro al guardar el usuario' });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.send({ message: 'Ingresa todos los datos' })
            }
        }


        if (resp[0] == 'login') {
            if (resp[1] != null && resp[2] != null) {
                User.findOne({ $or: [{ username: resp[1] }, { email: resp[1] }] }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el servidor' });
                    } else if (userFind) {
                        bcrypt.compare(resp[2], userFind.password, (err, checkPass) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else if (checkPass) {
                                if (resp[3] == 'true') {
                                    res.send({ token: jwt.createToken(userFind) });
                                } else {
                                    res.send({ user: userFind });
                                }
                            } else {
                                res.send({ message: 'Contraseña incorrecta' });
                            }
                        });
                    } else {
                        res.send({ message: 'Usuario no encontrado' });
                    }
                });
            } else {
                res.send({ message: 'Ingresa usuario y contraseña' });
            }
        }


        if (resp[0] == 'tweetAdd') {
            if (resp[1] != null) {

                tweet.content = resp.join(' ');
                tweet.content = tweet.content.replace('tweetAdd', '');
                tweet.content = tweet.content.replace(' ', '');

                tweet.save((err, tweetSaved) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el servidor' });
                    } else if (tweetSaved) {
                        res.send({ tweet: tweetSaved });
                    } else {
                        res.status(404).send({ message: 'No se ha podido guardar el tweet' });
                    }
                });
            } else {
                res.send({ message: 'Ingrese el contenido del tweet' });
            }
        }


        if (resp[0] == 'tweetSet') {
            if (resp[1] != null) {
                Tweet.findById(resp[1], (err, tweetFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el servidor' });
                    } else if (tweetFind) {
                        User.findByIdAndUpdate(resp[2], { $push: { tweets: resp[1] } }, { new: true }, (err, userUpdated) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else if (userUpdated) {
                                res.send({ user: userUpdated });
                            } else {
                                res.status(500).send({ message: 'No se ha podido insertar el tweet' });
                            }
                        });
                    } else {
                        res.send({ message: 'Tweet no encontrado' });
                    }
                });
            } else {
                res.send({ message: 'Ingresa el Id tweet' });
            }
        }


        if (resp[0] == 'tweetEdit') {
            if (resp[1] != null) {
                if (resp[2] != null) {
                    tweet.content = resp.join(' ');
                    tweet.content = tweet.content.replace('tweetEdit', '');
                    tweet.content = tweet.content.replace(resp[1], '');
                    tweet.content = tweet.content.replace('  ', '');

                    var update = tweet.content;
                    
                    Tweet.findByIdAndUpdate(resp[1], { $set: { content: update } }, { new: true }, (err, tweetUpdated) => {
                        if (err) {
                            res.status(500).send({ message: 'Error en el servidor' });
                        } else if (tweetUpdated) {
                            res.send({ tweet: tweetUpdated });
                        } else {
                            res.status(404).send({ message: 'Hubo un error al actualizar el tweet' });
                        }
                    });
                } else {
                    res.send({ message: 'Ingrese el nuevo contenido del tweet' });
                }
            } else {
                res.send({ message: 'Ingrese el Id del tweet' });
            }
        }

        if (resp[0] == 'tweetDelete') {
            if (resp[1] != null) {
                User.findByIdAndUpdate(auth.idUser, { $pull: { tweets: resp[1] } }, { new: true }, (err, deleted) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el servidor' });
                    } else if (deleted) {
                        Tweet.findByIdAndRemove(resp[1], (err, tweetFind) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else if (tweetFind) {
                                res.send({ user: deleted });
                            } else {
                                res.status(404).send({ message: 'No se ha encotrado el tweet' });
                            }
                        });
                    } else {
                        res.status(404).send({ message: 'No se ha podido eliminar el tweet' });
                    }
                });
            } else {
                res.send({ message: 'Ingrese el id del tweet que desea eliminar' });
            }
        }


        if (resp[0] == 'tweetsView') {
            if (resp[1] != null) {
                User.findOne({ username: { $regex: resp[1], $options: 'i' } }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el servidor' });
                    } else if (userFind) {
                        User.find({ username: resp[1] }, { tweets: 1, _id: 0 }, (err, tweets) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else {
                                Tweet.populate(tweets, { path: "tweets" }, (err, tweets) => {
                                    if (err) {
                                        res.status(500).send({ message: 'Error en el servidor' });
                                    } else if (tweets) {
                                        res.send({ user: resp[1], tweets });
                                    } else {
                                        res.status(404).send({ message: 'No se han podido mostrar los tweets' });
                                    }
                                });
                            }
                        });
                    } else {
                        res.send({ message: 'No se encontró el usuario' });
                    }
                });
            } else {
                res.send({ message: 'Ingrese el usuario de la persona a quien desea ver sus tweets' });
            }
        }


        if (resp[0] == 'follow') {
            if (resp[1] != null) {
                User.findOne({ username: { $regex: resp[1], $options: 'i' } }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el servidor' });
                    } else if (userFind) {
                        User.findOneAndUpdate({ username: resp[1] }, { $push: { followers: auth.idUser } }, { new: true }, (err, followed) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else if (followed) {
                                res.send({ user: followed });
                            } else {
                                res.status(404).send({ message: 'No has podido seguir a este usuario' });
                            }
                        });
                    } else {
                        res.send({ message: 'Usuario no encontrado' });
                    }
                });
            } else {
                res.send({ message: 'Ingresa el usuario a quien quieras seguir' });
            }
        }


        if (resp[0] == 'unfollow') {
            if(resp[1] != null){
                User.findOne({username: {$regex: resp[1], $options: 'i'} }, (err, userFind)=>{
                    if(err){
                        res.status(500).send({message: 'Error en el servidor.1'});
                    }else if(userFind){ 
                                User.findOneAndUpdate({username: resp[1]},{$pull:{followers: auth.idUser}}, {new:true}, (err, unfollow)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error en el servidor.3'});
                                    }else if(unfollow){
                                        res.send({message: 'Haz dejado de seguir a ' + resp[1]});
                                    }else{
                                        res.status(404).send({message: 'No haz podido dejar de seguir a este usuario'});
                                    }
                                });
                    }else{
                        res.status(404).send({message: 'Usuario no encontrado'});
                    }
                });
            }else{
                res.send({message: 'Ingresa el usuario a quien deseas dejar de seguir'});
            }
        }
}


module.exports = {
    commands
}