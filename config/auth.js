const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const passport = require('passport');

require('./../models/Usuario');
const Usuario = mongoose.model('usuarios');


module.exports = (passport)=>{
    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'senha'
    }, (email, senha, done)=>{

        Usuario.findOne({email: email}).then((usuario)=>{

         if(!usuario) {
          return done(null, false, {message: 'Usuário inexistente'});
         } 
         
         bcrypt.compare(senha, usuario.senha, (error, isIguais)=>{
             if(isIguais) {
              return done(null, usuario)
             } else {
                return done(null, false, {message: 'Dados incorretos'});
             }
         });

        });

    }));


    passport.serializeUser((usuario, done)=>{
     done(null, usuario.id);
    });

    passport.deserializeUser((id, done)=>{
       Usuario.findById(id, (error, usuario)=>{
        done(error, usuario);
       });
    });

};