const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const curl = require('curlrequest'); //Fuer die request an die Deutsche Bahn
//const async = require('async'); //Fuer async funktionalitaet
const Ajv = require('ajv'); //Fuer das validieren der json posts

const ressourceName = "route";

//Optionen fuer die curl-anfrage an die Deutsche Bahn
var options =
    {
        url : "https://api.deutschebahn.com/fasta/v1/stations/",
        method : 'GET',
        headers :
        {
        Accept : "application/json",
		Authorization: "Bearer  1017fb6c771d14ad25f3f1abc1b2758c"
        }
    };

//JSON Validation Schema fuer favroute
var postSchema = {
    "title" : "favroute",
    "description" : "Validating post favroutes",
    "type" : "object",
    "properties" : {
        "stations" : {
            "type" : "array",
            "minItems" : 2,
            "maxItems" : 2,
            "items" : {
                "title" : "station",
                "description" : "favroute post schema",
                "type" : "object",
                "properties" : {
                    "id" : {"type" : "integer"}
                },
                "required" : ["id"],
                "additionalProperties": false
            }
        }
    }
};

//Middleware
router.use(function timelog (req, res, next){
	console.log('Time: ', Date.now());
	next();
});

//Gibt eine Passende Route aus, wenn eine unter data.favroutes vorhanden
router.get('/', bodyParser.json(), function(req, res){
    var contentType = req.get('Content-Type');
    if(contentType != "application/json"){
         res.set("Accepts", "application/json").status(406).end();
    }else{
        var searchRoute = req.body;
        var ajv = Ajv({allErrors: true});
        //Pruefen ob die Parameter stimmen und ob die json valide ist
        if(!ajv.validate(postSchema, searchRoute)){ 
            res.set("Content-Type", 'application/json').status(400).end();
            return;
        }else{
            //Index der Favroute, dass mit star und ende uebereinstimmt wird gesucht
            var reqFavRoute = data.favroutes.findIndex(function(x){ return x.stations[0].id == searchRoute.stations[0].id
                                                                        && x.stations[x.stations.length-1].id == searchRoute.stations[1].id});
            if(reqFavRoute > -1){
                //Bei Erfolgreiche gefundenem Index wird die FavRoute ausgegeben
                res.set("Content-Type", 'application/json').status(200).json(data.favroutes[reqFavRoute]).end();
            }else{
                //Kein Index gefunden => gesuchte FavRoute nicht vorhanden => not found
                res.set("Content-Type", 'application/json').status(404).end();
            }
        }
    }
});

module.exports = router;