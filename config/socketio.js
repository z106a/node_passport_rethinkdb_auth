var config = require('./config');
    //cookieParser = require('cookie-parser');
   
    module.exports = function(server, io) {
        
        //io.use(function(socket, next) {
        
        //});
        
        io.on('connection', function(socket) {
           // console.log('someone connect to a socket');
            require('../app/controllers/chat.server.controller')(io, socket);
        }); 
    };
