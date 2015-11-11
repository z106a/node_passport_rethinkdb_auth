var r = require('rethinkdb'),
    assert = require('assert');

     var dbConfig = {
        host: process.env.RDB_HOST || '192.168.100.15',
        port: parseInt(process.env.RDB_PORT) || 28015,
        db  : process.env.RDB_DB || 'rnode_mngmnt_user',
        tables: {
            'users': 'id',
            
           
        }
    };

    exports.dbConfig = dbConfig;
    // Create a secondary index on the node_name attribute
    // r.table("users").indexCreate("email").run(conn, callback)
           



module.exports.setup = function() {
  r.connect({host: dbConfig.host, port: dbConfig.port }, function (err, connection) {
    assert.ok(err === null, err);
    r.table('users').indexWait('email').run(connection, function(err, result){
      if(err) {
        // The database/table/index was not available, create them
        r.dbCreate(dbConfig.db).run(connection, function(err, result) {
          if((err) && (!err.message.match(/Database `.*` already exists/))){
            console.log("Could not create the database `"+config.db+"`");
            console.log(err);
            process.exit(1);
          }
          console.log('Database `'+dbConfig.db+'` created.');
          r.db(dbConfig.db).tableCreate('users').run(connection, function(err, result) {
              if ((err) && (!err.message.match(/Table `.*` already exists/))) {
              console.log("Could not create the table `users`");
              console.log(err);
              process.exit(1);
            }
          console.log('Table `users` created.');
          r.db(dbConfig.db).table('users').indexCreate('email').run(connection, function(err, result) {
            if ((err) && (!err.message.match(/Index `.*` already exists/))) {
              console.log("Could not create the index `email`");
              console.log(err);
              process.exit(1);
            }
          console.log('Index `email` created.');
          console.log("Table and index are available, starting express...");
        });
        });
        });
      }
      else {
            console.log("Table and index are available, starting express...");
        }
    
    });
  });
}

    // r.dbCreate(dbConfig.db).run(connection, function(err, result) {
    //     if(err) {
    //         console.log("[DEBUG] RethinkDB database '%s' already exists (%s:%s)\n%s", dbConfig.db, err.name, err.msg, err.message);
    //     }
    //     else {
    //         console.log("[INFO ] RethinkDB database '%s' created", dbConfig.db);
    //     }

    //     for(var tbl in dbConfig.tables) {
    //         (function (tableName) {
    //             r.db(dbConfig.db).tableCreate(tableName, {primaryKey: dbConfig.tables[tbl]}).run(connection, function(err, result) {
    //             if(err) {
    //             console.log("[DEBUG] RethinkDB table '%s' already exists (%s:%s)\n%s", tableName, err.name, err.msg, err.message);
    //         }
    //         else {
    //           console.log("[INFO ] RethinkDB table '%s' created", tableName);
    //         }
    //       });
    //     })(tbl);
    //   }
    // });
    // r.db(dbConfig.db).table('users').indexCreate("email");
    
  // });
    /*
    r.connect({host: dbConfig.host, port: dbConfig.port }).then(function(conn){
        r.db(dbConfig.db).table('containers').changes().run(conn).then(function(cursor){
            cursor.each(function(err, row){
                socket.emit('chatMessage', row.new_val);
            }, function(){
                console.log('db onChange containers Finished');
                });
        });
    });
    */
// };



/// RNONDE_MNGMNT_USER 
    module.exports.findUserbyId = function(id, callback){
      onConnect(function (err, connection){
        r.db(dbConfig.db).table('users').get(id.toString())
          .run(connection, function(err, res){
            if (err) throw err;
             callback(null, res);
          })
      });
    }

    module.exports.findOne = function (email, callback) {
        onConnect(function (err, connection) {
          r.db(dbConfig.db).table('users').getAll(email, {index: 'email'})
          .run(connection, function(err, cursor){
            if(err){
              console.log("[ERROR][%s][findOne][collect] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
              callback(err);
            }
            else {
              cursor.toArray(function(err, results){
                if(err){
                  console.log("[ERROR][%s][findOne][collect] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
                  callback(null, []);
                }
                else {
                  callback(null, results);
                }
                connection.close();
              });
            }
          });
        });
    };

    module.exports.createUser = function (user, callback) {
      onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('users').insert(user).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][createUser] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.inserted === 1) {
          callback(null, result);
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

function onConnect(callback) {
  r.connect({host: dbConfig.host, port: dbConfig.port }, function(err, connection) {
    assert.ok(err === null, err);
    connection['_id'] = Math.floor(Math.random()*10001);
    callback(err, connection);
  });
}
