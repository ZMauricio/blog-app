module.exports = {
    isAdmin: function(req, res, next) {
    
     // req.isAuthenticated() é uma função criada pelo passport
     // que serve para checar se o usuário está autenticado
     if(req.isAuthenticated() && req.user.isAdmin===1) {
      return next();
     }

     req.flash('error_msg', 'Você deve estar logado como administrador para acessar este módulo');
     res.redirect('/');
    }
};