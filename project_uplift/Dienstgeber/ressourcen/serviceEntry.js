const express = require("express");
const router = express.Router();

const ressourceName = "serviceEntry";

var dgHost = "http://localhost:3773"

//Diese GET Anfrage liefert die Interaktionsmoeglicheiten mit dem Dienst

//Middleware
router.use(function timelog (req, res, next){
    console.log('-----------------------');
	console.log('Time: ', Date.now());
    console.log('Method: ',req.method);
    console.log('URL: ',req.url);
	next();
});

router.all('/', function(req,res){
    var service =
        {
            "FavRoute" : '/favroute',
            "FavEquipment" : '/favequipment',
            "Bewertung" : '/bewertung'
        }
    
    res.status(200).json(service).end();
});

module.exports = router;