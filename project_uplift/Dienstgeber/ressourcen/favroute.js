const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser')

const ressourceName = "favroute";

//Middleware
router.use(function timelog (req, res, next){
	console.log('Time: ', Date.now());
	next();
});

router.post('/', bodyParser.json(), function(req,res){
   //Content-Type des Headers pruefen
   var contentType = req.get('Content-Type');
   if(contentType != "application/json"){
        res.set("Accepts", "application/json").status(406).end();
   }else{
        var newFavRoute = req.body;
        //Weiter bearbeitung der json
        
        res.set("Content-Type", 'application/json').set("Location", "/favroute/").status(201).json(newFavRoute).end();
   }
});

router.get('/', function(req, res){
	res.send("GET Hello World!");
});

module.exports = router;