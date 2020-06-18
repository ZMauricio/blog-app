//=== Carregando módulos ===
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

require('./config/auth')(passport);

require('./models/Postagem');
require('./models/Categoria');
const Postagem = mongoose.model('postagens');
const Categoria = mongoose.model('categorias');
const routesAdmin = require('./routes/admin');
const routesUsuario = require('./routes/usuario');


const app = express();

//=== Configurações ===

// session
app.use(session({
    secret: 'chaveSecretaSessao',
    resave: true,
    saveUninitialized: true
}));

// passport (Estas definições devem ser feitas após as definições de session e antes das definições de flash)
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash()); // deve ser definido após se configurar a sessão

// Middlewares
app.use((req, res, next)=>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  // res.locals.user armazena os dados do usuário autenticado e
  // req.user é criado automaticamente pelo passport para 
  // armazenar os dados do usuário autenticado
  res.locals.user = req.user || null;
  next();
});

// morgan
// o morgan serve para monitorar a execução
// do projeto, imprimindo logs do que está
// ocorrendo (ações executadas) no terminal
// Ex: GET /produtos 200 25.431 ms - 55
app.use(morgan('dev'));

// Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//=== Public (arquivos estáticos) ===
// express.static() informa ao express que a pasta public contém os arquivos estáticos
 app.use(express.static(path.join(__dirname, 'public')));
// funciona também
// app.use(express.static('public'));


// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://mauricio:123@localhost/blogapp', {
 useNewUrlParser: true,
 useUnifiedTopology: true
}).then(()=>{
    console.log('Conectado ao mongo!');
}).catch((error)=>{
    console.log('Erro ao conectar:', error);
});



//=== Rotas ===
app.use('/admin', routesAdmin);
app.use('/usuarios', routesUsuario);

app.get('/', (req, res)=>{
    Postagem.find().populate('categoria').sort({date: 'desc'}).then((postagens)=>{
     
     res.render('index', {postagens: postagens.map((item)=>{
         return item.toJSON();
     })});
    }).catch((error)=>{
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/404');
    });
    
});

app.get('/postagem/:slug', (req, res)=>{
    Postagem.findOne({slug: req.params.slug}).then((postagem)=>{
        if(postagem) {
            res.render('postagem/index', {postagem: postagem.toJSON()});
        } else {
            req.flash('error_msg', 'Esta postagem não existe!');
            res.redirect('/');
        }
    }).catch((error)=>{
        req.flash('error_msg', 'Houve um erro interno!');
        res.redirect('/');
    });
});

app.get('/categorias', (req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render('categorias/index', {categorias: categorias.map((item)=>{
            return item.toJSON();
        })});
    }).catch((error)=>{
        req.flash('error_msg', 'Erro interno ao listar as categorias!');
        res.redirect('/');
    });
});

app.get('/categorias/:slug', (req, res)=>{
    Categoria.findOne({slug: req.params.slug}).then((categoria)=>{

        if(categoria) {
         
         Postagem.find({categoria: categoria._id}).then((postagens)=>{
            res.render('categorias/postagens', {
                categoria: categoria.toJSON(),
                postagens: postagens.map((item)=>{
                    return item.toJSON();
                })
            });
         }).catch((error)=>{
                req.flash('error_msg', 'Erro ao listar as postagens!');
                res.redirect('/');
         });

        } else {
            req.flash('error_msg', 'Erro esta categoria não existe!');
            res.redirect('/');
        }
    }).catch((error)=>{
        req.flash('error_msg', 'Erro interno ao carregar a página desta categoria!');
        res.redirect('/');
    });
});



app.get('/404', (req, res)=>{
    res.send('Erro 404!');
});




const PORT = 8081;

app.listen(PORT, ()=>{
 console.log('Servidor rodando!');
});