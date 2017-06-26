var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');


//Middleware
router.use(function timelog (req, res, next){
	console.log('Time: ', Date.now());
	next();
});

router.post('/', function(req,res){
   
    var contentTyp = req.get('Content-Type');
    
    if(contentTyp != "application/json"){
        res.set("Accepts", "application/json").status(406).end();
    }else{
        var newFavRoute = req.body;
        //Weiter bearbeitung der json
        
        
        res.set("Content-Type", 'application/json').set("Location", "/favroute/").status(201).json(newFavRoute).end();
    }
});

module.exports = router;