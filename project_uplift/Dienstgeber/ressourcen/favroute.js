const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const curl = require('curlrequest'); //Fuer die request an die Deutsche Bahn
const async = require('async'); //Fuer async funktionalitaet
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
                "title" : "station",
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

router.post('/', bodyParser.json(), function(req,res){
   //Content-Type des Headers pruefen
   var contentType = req.get('Content-Type');
   if(contentType != "application/json"){
        res.set("Accepts", "application/json").status(406).end();
   }else{
        var newFavRoute = req.body;
        //Alle Errors der Validation sammeln, standard ist return nach erstem
        var ajv = Ajv({allErrors: true});
        var valid = ajv.validate(postSchema, newFavRoute);
        if (valid) {
            console.log('User data is valid');
            //Vergabe der ID an neue FavRoute
            newFavRoute.id = favrouteID++;
            data.favroutes.push(newFavRoute);
            console.log(newFavRoute);
            res.set("Content-Type", 'application/json').set("Location", "/favroute/" + (favrouteID - 1)).status(201).json(newFavRoute).end();
        } else {
            console.log('User data is INVALID!');
            console.log(ajv.errors);
            res.set("Content-Type", 'application/json').status(400).end();
        }
   }
});

router.put('/:id', bodyParser.json(), function(req, res){
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
            //Variable zum pruefen ob es geaendert wurde
            var changed = false;
            for(var i=0;i<data.favroutes.length;i++){
                if(reqID == data.favroutes[i].id){
                    //Ersetzen der Route mit einer Neuen/Bearbeiteten
                    changeFavRoute.id = reqID;
                    data.favroutes[i] = changeFavRoute;
                    changed = true;
                    console.log(data.favroutes[i]);
                    res.set("Content-Type", 'application/json').status(201).json(data.favroutes[i]).end();   
                }
            }
            if(!changed){ res.set("Content-Type", 'application/json').status(400).end(); }
        }
        //data.favroutes.push(newFavRoute);
        //res.set("Content-Type", 'application/json').status(201).json(newFavRoute).end();
    }
});

router.get('/:id', function(req, res){
    var reqID = parseInt(req.params.id);
    
    //Pruefen ob der Parameter stimmt
    if(isNaN(reqID) && reqID >= 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        //Eintrag mit der passenden ID wird gesucht
        var reqRoute = data.favroutes.find(function(x){ return x.id === reqID });
        //Check ob reqRoute leer ist => keine route unter dieser id vorhanden
        if(reqRoute == null){ 
            res.set("Content-Type", 'application/json').status(404).end(); 
        }else{
            
            //Array mit den Stationen, die als Response am Ende gesendet werden
            var finalRes = [];
            //console.log(reqRoute.stations);
            
            //Der Wrapper fuer die sendRequest Funktion. Stellt die Optionen fuer die curl-request ein
            function sendRequestWrapper(n, done){
                console.log('Calling sendRequest: ', n);
                //URL anpassen
                var currentOptions = options;
                currentOptions.url = ("https://api.deutschebahn.com/fasta/v1/stations/" + reqRoute.stations[n].id);
                console.log("request an: " + currentOptions.url);
                //Request wird gestartet, die Optionen und der counter n werden mituebergeben
                sendRequest(currentOptions, n, function(err){
                    console.log("Erledigt?");
                    done(err);
                });
            };
            
            //Funktion, die den curl-request versendet
            function sendRequest(currentOptions, n, callback){
                //curl-request an die Deutsche Bahn api mit den passenden Optionen
                curl.request(currentOptions, function(err, dbDaten){
                    //AUF ERRORS CHECKEN
                    var dbDaten = JSON.parse(dbDaten);
                    //Variable Station, die dann auf das Array "finalRes" gepusht wird
                    var newStation = {};
                    //Name der Station aus den erhaltenen Daten
                    newStation.name = dbDaten.name;
                    //Array fuer das jeweilige Equipment an der Station
                    //Ist das Array am Ende leer gibt es kein Equipment an der Station
                    newStation.equipment = [];
                    
                    //Schleife zum pushen des Equipments auf das newStation.equipment Array
                    for(var j = 0; j < dbDaten.facilities.length; j++) {
                        //Pruefen ob Equipment auf dem jeweiligen Gleis vorhanden ist
                        if(dbDaten.facilities[j].description.indexOf(reqRoute.stations[n].gleis.toString()) >= 0){
                            var equip1 ={
                                "equipmentTyp" : dbDaten.facilities[j].type,
                                "beschreibung" : dbDaten.facilities[j].description,
                                "status" : dbDaten.facilities[j].state
                            }
                            newStation.equipment.push(equip1);
                        }
                    }
                    finalRes.push(newStation);
                    console.log("Added " + newStation);
                    callback(null);
                });
            };
            
            //Aufruf der async Funktion timesSeries, zum seriellen Abarbeiten der curl-requests
            async.timesSeries(reqRoute.stations.length, sendRequestWrapper, function (err, results){
                //Wenn alle Abfragen bearbeitet wurden und eine Response erstellt wurde
                console.log("Done!");
                res.set("Content-Type", 'application/json').status(200).json(finalRes).end();
            });
            //console.log(finalRes);
            //res.set("Content-Type", 'application/json').status(200).json(finalRes).end();
        }
    }
});

router.delete('/:id', function(req, res){
	var reqID = parseInt(req.params.id);
    
    //Pruefen ob der Parameter stimmt
    if(isNaN(reqID) && reqID >= 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        //Schleife, um die FavRoute mit der passenden ID zu finden
        for(var i=0;i<data.favroutes.length;i++){
            if(reqID == data.favroutes[i].id){
                var removedRoute = data.favroutes.splice(i, 1);
            }
        }
        //Wenn nichts zum entfernen gefunden wurde
        if(removedRoute == null){ 
            res.set("Content-Type", 'application/json').status(404).end(); 
        }else{
            //Erfolgreich ein Objekt entfernt
            console.log(removedRoute);
            res.set("Content-Type", 'application/json').status(200).end();
        }        
    }
});

router.get('/', function(req, res){
    res.set("Content-Type", 'application/json').status(200).json(data.favroutes).end();
});

module.exports = router;