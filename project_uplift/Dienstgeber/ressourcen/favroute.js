const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const curl = require('curlrequest'); //Fuer die request an die Deutsche Bahn
//const async = require('async'); //Fuer async funktionalitaet
const Ajv = require('ajv'); //Fuer das validieren der json posts

const ressourceName = "favroute";

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
            "items" : {
                "title" : "stations",
                "description" : "favroute post schema",
                "type" : "object",
                "properties" : {
                    "id" : {"type" : "integer"},
                    "gleis" : {"type" : "integer"}
                },
                "required" : ["id", "gleis"],
                "additionalProperties": false
            }
        }
    }
};

//ID Variable fuer die zu erstellenden FavRouten
var favrouteID = 0;

//Middleware
router.use(function timelog (req, res, next){
	console.log('Time: ', Date.now());
	next();
});

//Postet eine neue route
router.post('/', bodyParser.json(), function(req,res){
   //Content-Type des Headers pruefen
   var contentType = req.get('Content-Type');
   if(contentType != "application/json"){
        res.set("Accepts", "application/json").status(406).end();
   }else{
        var newFavRoute = req.body;
        //Alle Errors der Validation sammeln, standard ist return nach erstem
        var ajv = Ajv({allErrors: true});
        if (ajv.validate(postSchema, newFavRoute)) {
            //json Daten stimmen dem schema ueberein
            //Vergabe der ID an neue FavRoute und pushen auf das Array
            newFavRoute.id = favrouteID++;
            data.favroutes.push(newFavRoute);
            console.log(newFavRoute);
            res.set("Content-Type", 'application/json').set("Location", "/favroute/" + (favrouteID - 1)).status(201).json(newFavRoute).end();
        } else {
            res.set("Content-Type", 'application/json').status(400).end();
        }
   }
});

//Aendert eine bereits vorhandene Route
router.put('/:id', bodyParser.json(), function(req, res){
    //Parameter fuer die favroute, die veraendert werden soll
    var reqID = parseInt(req.params.id);
    var contentType = req.get('Content-Type');
    if(contentType != "application/json"){
         res.set("Accepts", "application/json").status(406).end();
    }else{
        var changeFavRoute = req.body;
        var ajv = Ajv({allErrors: true});
        //Pruefen ob die Parameter stimmen und ob die json valide ist
        if(isNaN(reqID) || reqID < 0 || !ajv.validate(postSchema, changeFavRoute)){ 
            res.set("Content-Type", 'application/json').status(400).end(); 
        }else{
            //Index der zu aendernden Route wird gesucht
            var routeID = data.favroutes.findIndex(function(x){ return x.id === reqID });
            if(routeID > -1){
                //Index der Route gefunden, jetzt wird sie geaendert
                changeFavRoute.id = reqID;
                data.favroutes[routeID] = changeFavRoute;
                console.log(data.favroutes[routeID]);
                res.set("Content-Type", 'application/json').status(201).json(data.favroutes[routeID]).end();
            }else{
                //keine Route mit der passenden ID gefunden => not found
                res.set("Content-Type", 'application/json').status(404).end();
            }
        }
    }
});

//Gibt eine vorhandene Route aus
router.get('/:id', function(req, res){
    //Der Parameter des gesuchten Equipment
    var reqID = parseInt(req.params.id);
    if(isNaN(reqID) || reqID < 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        //Index der Favroute, dass man sucht wird im Array gesucht
        var reqFavRoute = data.favroutes.findIndex(function(x){ return x.id === reqID });
        if(reqFavRoute > -1){
            //Bei Erfolgreiche gefundenem Index wird die FavRoute ausgegeben
            res.set("Content-Type", 'application/json').status(200).json(data.favroutes[reqFavRoute]).end();
        }else{
            //Kein Index gefunden => gesuchte FavRoute nicht vorhanden => not found
            res.set("Content-Type", 'application/json').status(404).end();
        }
    }
});

//Entfernt eine vorhandene Route
router.delete('/:id', function(req, res){
	var reqID = parseInt(req.params.id);
    
    //Pruefen ob der Parameter stimmt
    if(isNaN(reqID) || reqID < 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        var routeID = data.favroutes.findIndex(function(x){ return x.id === reqID });
        if(routeID > -1){
            //Index der Route gefunden, wird jetzt geloescht
            var removedRoute = data.favroutes.splice(routeID, 1);
            console.log(removedRoute);
            res.set("Content-Type", 'application/json').status(200).end();
        }else{
            res.set("Content-Type", 'application/json').status(404).end();
        }        
    }
});

//Holt alle vorhandenen routen
router.get('/', function(req, res){
    res.set("Content-Type", 'application/json').status(200).json(data.favroutes).end();
});

module.exports = router;