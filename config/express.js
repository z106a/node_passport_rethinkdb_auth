var config = require('./config'),
    http = require('http'),
    socketio = require('socket.io'),
    express = require('express'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    flash = require('connect-flash')
    r = require('./rethinkdb.js');

module.exports = function() {
 var app = express();
 var server = http.createServer(app);
 var io = socketio.listen(server); 

 r.setup()
 
 if (process.env.NODE_ENV === 'development') {
       app.use(morgan('dev')); // log every req to the console
     } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
       }
    

    require('./passport.js')(passport);

    app.use(bodyParser.urlencoded({
       extended: true
     }));
     
    app.use(bodyParser.json()); // get information from html forms
    app.use(cookieParser()); // read cookies (needed for auth)
    app.use(methodOverride());

    app.use(session({
       saveUninitialized: true,
       resave: true,
       secret: 'secret'
    }));
    
    app.set('views', './app/views');
    app.set('view engine', 'ejs');
    
    app.use(passport.initialize());
    app.use(passport.session());  //persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session


 require('../app/routes/index.server.routes.js')(app);
 require('../app/routes/auth.server.routes.js')(app, passport);

 // require('../app/routes/nodes_status.server.routes.js')(app);
 
 app.use(express.static('./public'));
   
 require('./socketio')(server, io); 
 return server;
};
