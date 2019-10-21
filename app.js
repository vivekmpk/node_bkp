const express           =   require('express');
const bodyParser        =   require('body-parser');
const http              =   require('http');
const mysql             =   require('mysql');
const myConnection      =   require('express-myconnection');
const path              =   require('path');
const session           =   require('express-session');
const cookieParser      =   require('cookie-parser');
const methodOverride    =   require('method-override');
const flash             =   require('express-flash');
const fileUpload        =   require('express-fileupload');
const expressValidator  =   require('express-validator');
const _                 =   require('lodash');
const moment            =   require('moment');
const uniqid            =   require('uniqid');
const app               =   express();
const localStorage      =   require('localStorage');

//load database connection
var dbConfig            =   require('./dbConfig');

var dbConn              =   {
    host                : dbConfig.database.host,
    user                : dbConfig.database.user,
    password            : dbConfig.database.password,
    database            : dbConfig.database.dbName,
    port                : dbConfig.database.port
}

app.use(myConnection(mysql,dbConn,'pool'));

//load routes files
const routes              =   require('./loadroutes');


//load view engine
app.set('view engine','ejs');

// set path for views files
app.set('views',path.join(__dirname,'views'));

//set port 
app.set('port', process.env.port || dbConfig.server.port);

//set body parser values into json format
app.use(bodyParser.urlencoded({ limit: '50mb', extended :false }));
app.use(bodyParser.json());

//set path for frontend assets files
app.use(express.static(path.join(__dirname,'/assets')));

//load files
app.use(fileUpload());
//app.use(expressValidator());
app.use(cookieParser());
app.use(flash());
app.locals.moment   = moment;

app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));

//load cookie & sessions
app.use(cookieParser('coursy_session'));

app.use(session({
    key     : 'sample_session',
    secret  : 'secret@sample',
    resave  : false,
    saveUninitialized : true,
    cookie  : { maxAge : Date.now() + (30 * 86400 * 100000) }
}));


//store session values in locals
app.use(function(req, res, next){
    res.locals.name = 'vivek';
    res.locals._ = _;
    next();
});

// Custom flash middleware
app.use(function(req, res, next){
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

var loc = localStorage.getItem('uid')
if(!loc)
{
    localStorage.setItem('uid', uniqid())
}

// load paths in global
app.locals = {
    baseUrl     : "http://localhost:5000",
    webtitle    : ' | Sample'
};
global.websiteUrl = "http://localhost:5000"
global.uid = localStorage.getItem('uid')

//load files
app.use('/',routes.homepage);


//Catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    //next(err);
    res.render('404-page');
});

http.createServer(app).listen(app.get('port'), function(req,res){
    
    console.log(`Server running on port : ${dbConfig.server.port}`);
});

module.exports = app;

