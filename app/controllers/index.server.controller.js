exports.render = function(req, res){
    if (req.session.lastVisit) {
       console.log(req.session.lastVisit);
    
    }
     req.session.lastVisit = new Date();

    var last_session = req.session.lastVisit;

 res.render('index', {
    title: 'Hello world',
    last_session: last_session,
    })
};
