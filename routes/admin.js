const express = require('express');
const mongoose = require('mongoose');
const { isAdmin } = require('./../helpers/isAdmin');

const router = express.Router();

require('./../models/Categoria');
require('./../models/Postagem');

const Categoria = mongoose.model('categorias');
const Postagem = mongoose.model('postagens');


router.get('/', isAdmin, (req, res)=>{
    // res.send('Página principal do painel ADMIN');
    res.render('admin/index');
});

router.get('/posts', isAdmin, (req, res)=>{
 res.send('Página de posts');
});

router.get('/categorias', isAdmin, (req, res)=>{
    Categoria.find().sort({date:'desc'}).then((categorias)=>{
      console.log('categorias', categorias);

      res.render('admin/categorias', {categorias: categorias.map((categoria)=>{
          return categoria.toJSON();
      })});
    }).catch((error)=>{
        // console.log('error', error);
        req.flash('error_msg', 'Erro ao listar as categorias!');
        res.redirect('/admin');
    });
    
});

router.get('/categorias/add', isAdmin, (req, res)=>{
    res.render('admin/addcategorias');
});

router.post('/categorias/nova', isAdmin, (req, res)=>{
   let erros = [];

   if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
    erros.push({texto: "Nome inválido!"});
   }

   if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
    erros.push({texto: "Slug inválido!"});
   }

   if(req.body.nome.length<2) {
    erros.push({texto: "Nome da categoria pequeno!"});
   }

   if(erros.length>0) {
    res.render('admin/addcategorias', {erros: erros});
   } else {

      const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
      };
   
      new Categoria(novaCategoria).save().then(()=>{
           console.log('Categoria salva com sucesso!');

           req.flash('success_msg', 'Categoria salva com sucesso!');
           res.redirect('/admin/categorias');
      }).catch((error)=>{
           console.log('Erro ao salvar a categoria: ', error);
           req.flash('error_msg', 'Erro ao salvar a categoria!');
           res.redirect('/admin');
      });
   }

});

router.get('/categorias/edit/:id', isAdmin, (req, res)=>{
    Categoria.findById(req.params.id).then((categoria)=>{
        res.render('admin/editcategoria', {categoria: categoria.toJSON()});
    }).catch((error)=>{
        req.flash('error_msg', 'Esta categoria não existe!');
        res.redirect('/admin/categorias');
    });
});

router.post('/categorias/edit', isAdmin, (req, res)=>{
    Categoria.findById(req.body.id).then((categoria)=>{
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;
        categoria.save().then(()=>{
          req.flash('success_msg', 'Categoria atualizada!');
          res.redirect('/admin/categorias');
        }).catch((error)=>{
            req.flash('error_msg', 'Erro interno ao editar a categoria!');
            res.redirect('/admin/categorias');
        });

    }).catch((error)=>{
        req.flash('error_msg', 'Erro ao editar a categoria!');
        res.redirect('/admin/categorias');
    });
});

router.post('/categorias/deletar', isAdmin, (req, res)=>{
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash('success_msg', 'Categoria deletada!');
        res.redirect('/admin/categorias');
    }).catch((error)=>{
        req.flash('error_msg', 'Erro ao deletar a categoria!');
        res.redirect('/admin/categorias');
    });
});

router.get('/postagens', isAdmin, (req, res)=>{
    // O método populate() busca as informações de toda a categoria cuja
    // Postagem está associada.
    // categoria é o nome do campo do model Postagem
    Postagem.find().populate('categoria').sort({date: 'desc'}).then((postagens)=>{
        console.log('postagens', postagens);

        res.render('admin/postagens', {postagens: postagens.map((objeto)=>{
        return objeto.toJSON();
     })});
    }).catch((error)=>{
        req.flash('error_msg', 'Erro ao listar as postagens!');
        res.redirect('/admin/postagens');
    });

    
});

router.get('/postagens/add', isAdmin, (req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render('admin/addpostagem', {categorias: categorias.map((categ)=>{
            return categ.toJSON();
        })});
    }).catch((error)=>{
        req.flash('error_msg', 'Erro ao criar a postagem!');
        res.redirect('/admin');
    });
    
});

router.post('/postagens/nova', isAdmin, (req, res)=>{
    let erros = [];

    if(!req.body.titulo || typeof req.body.titulo === undefined || req.body.titulo === null) {
        erros.push({texto: "Titulo inválido!"});
    }

    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        erros.push({texto: "Slug inválido!"});
    }

    if(!req.body.descricao || typeof req.body.descricao === undefined || req.body.descricao === null) {
        erros.push({texto: "Descrição inválida!"});
    }

    if(!req.body.conteudo || typeof req.body.conteudo === undefined || req.body.conteudo === null) {
        erros.push({texto: "Conteúdo inválido!"});
    }

    if(req.body.titulo.length<2) {
     erros.push({texto: "Tamanho do título pequeno!"});
    }

    if(req.body.categoria == '0') {
     erros.push({texto: 'Categoria inválida, registre uma categoria.'});
    }

    if(erros.length>0) {
     res.render('admin/addpostagem', {erros: erros});
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        };

        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg', 'Postagem criada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((error)=>{
            req.flash('error_msg', 'Erro ao criar a postagem!');
            res.redirect('/admin/postagens');
        });
    }


});

router.get('/postagens/edit/:id', isAdmin, (req, res)=>{
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{

        Categoria.find().then((categorias)=>{
            res.render('admin/editpostagem', {
                postagem: postagem.toJSON(),
                categorias: categorias.map((objeto)=>{
                    return objeto.toJSON()
                })
            });
        }).catch((error)=>{
            req.flash('error_msg', 'Erro ao listar as categorias!');
            res.redirect('/admin/postagens');
        });

    }).catch((error)=>{
        req.flash('error_msg', 'Erro ao pesquisar a postagem!');
        res.redirect('/admin/postagens');
    });
    
});

router.post('/postagens/edit', isAdmin, (req, res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            
            console.log('edit postagem', postagem);

            req.flash('success_msg', 'Postagem editada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((error)=>{
            req.flash('error_msg', 'Erro ao editar a postagem!');
            res.redirect('/admin/postagens');
        });

    }).catch((error)=>{
        req.flash('error_msg', 'Erro ao editar a postagem!');
        res.redirect('/admin/postagens');
    });
});

router.get('/postagens/deletar/:id', isAdmin, (req, res)=>{
    Postagem.remove({_id: req.params.id}).then(()=> {
        req.flash('success_msg', 'Postagem deletada com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao deletar a postagem!');
        res.redirect('/admin/postagens');
    });
});

module.exports = router;