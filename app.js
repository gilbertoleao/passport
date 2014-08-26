/**
* Dependencias
*/

var express = require('express'), 	
	passport = require('passport'),	
	passportLocal = require('passport-local'),
	flash = require('connect-flash'),
	bodyParser   = require('body-parser'),
	cookieParser = require('cookie-parser'),
	expressSession = require('express-session'),
	path = require('path');

var app = express();

/**
* Servidor
*/
var port = process.env.PORT || 3000;

app.listen(port, function(){
	console.log("Servidor Iniciado na porta " + port);
});


app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(expressSession({
	secret : process.env.SESSION_SECRET || 'codate 2014',
	resave : false,
	saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());


/**
* Rotas
*/
app.get('/', isUserAuthenticated, function(req, res) {
 		res.render('index', {user : req.user});
});

app.get('/login', function(req, res) {
	res.render('login',{ message: req.flash('error') });
});

app.post('/login', passport.authenticate('local' ,{ failureRedirect: '/login', failureFlash: true }),  function(req, res) {
	res.redirect('/');
});


app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});


app.get('/somos-codate', isUserAuthenticated, function(req, res) {
	res.render('somos-codate',{ user : req.user });
});

app.get('/nossos-produtos', isUserAuthenticated, function(req, res) {
	res.render('nossos-produtos', { user : req.user });
});

//redireciona as requisições não validas para a pagina 404
app.use(function(req, res, next) {
    res.render('404');
});

/**
* Configuração do Passport
*/
passport.use(new passportLocal.Strategy(
  function(username, password, callback) {	
	if (password === username) {	
		callback(null, { id: username, name : username});
	} else {	
		callback(null, false, { message: 'Usuário ou senha inválidos' });
	}
}));

passport.serializeUser(function(user, callback){
	callback(null, user.id);
});

passport.deserializeUser(function(id, callback){
	callback(null, {id : id, name : id});
});

/**
* Função para verificar se requisição possui um usuario autenticado
*/
function isUserAuthenticated(req, res, callback){
	if(req.isAuthenticated()) {
 		callback();
 		
	} else {
		res.redirect('/login');
	}
}