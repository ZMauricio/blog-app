const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

require('./../models/Usuario');
const Usuario = mongoose.model('usuarios');

router.get('/registro', (req, res)=>{
    res.render('usuarios/registro');
});

router.post('/registro', (req, res)=>{
    let erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: 'Nome de usuário inválido'});
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: 'E-mail de usuário inválido'});
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: 'Senha de usuário inválida'});
    }

    if(req.body.senha.length<6) {
     erros.push({texto: 'Senha deve ter pelo menos 6 caracteres'});
    }

    if(req.body.senha != req.body.repitasenha) {
        erros.push({texto: 'As senhas são diferentes, tente novamente'});
    }

    if(erros.length > 0) {
     res.render('usuarios/registro', {erros: erros});
    } else {
        Usuario.findOne({email: req.body.email}).then((usuario)=>{

            if(usuario) {
                req.flash('error_msg', 'Já existe uma conta com este e-mail no sistema');
                res.redirect('/usuarios/registro');
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });

                bcrypt.genSalt(10, (error, salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        if(erro) {
                         req.flash('error_msg', 'Erro durante o salvamento do usuário');
                         res.redirect('/');
                        }
                        
                        novoUsuario.senha = hash;

                        novoUsuario.save().then(()=>{
                         req.flash('success_msg', 'Usuário criado com sucesso');
                         res.redirect('/');
                        }).catch((error)=>{
                            req.flash('error_msg', 'Erro durante a criação do novo usuário, tente novamente');
                            res.redirect('/usuarios/registro');
                        });

                    });
                });

            }

        }).catch((error)=>{
            req.flash('error_msg', 'Erro interno ao cadastrar o usuário!');
            res.redirect('/');
        });
    }

});

router.get('/login', (req, res)=>{
    res.render('usuarios/login');
});

router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next);
});


router.get('/logout', (req, res, next)=>{
    // req.logOut();
    req.logout();
    req.flash('success_msg', 'Deslogado com sucesso');
    res.redirect('/');
});

module.exports = router;