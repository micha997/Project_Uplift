const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const curl = require('curlrequest'); //Fuer die request an die Deutsche Bahn
const async = require('async'); //Fuer async funktionalitaet
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
            //Passende Route wird aus dem Array gefiltert
            var foundRoute = data.favroutes.find(function(x){ return x.stations[0].id == searchRoute.stations[0].id
                                                                  && x.stations[x.stations.length-1].id == searchRoute.stations[1].id});
            console.log(foundRoute);
        }
        if(foundRoute == null){
            //Keine Route gefunden
            res.set("Content-Type", 'application/json').status(404).end();
        }else{
            //Route gefunden
            //Array mit den Stationen, die als Response am Ende gesendet werden
            var finalRes = [];
            //Der Wrapper fuer die sendRequest Funktion. Stellt die Optionen fuer die curl-request ein
            function sendRequestWrapper(n, done){
                console.log('Calling sendRequest: ', n);
                //URL anpassen
                var currentOptions = options;
                currentOptions.url = ("https://api.deutschebahn.com/fasta/v1/stations/" + foundRoute.stations[n].id);
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
                        if(dbDaten.facilities[j].description.indexOf(foundRoute.stations[n].gleis.toString()) >= 0){
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
            async.timesSeries(foundRoute.stations.length, sendRequestWrapper, function (err, results){
                //Wenn alle Abfragen bearbeitet wurden und eine Response erstellt wurde
                console.log("Done!");
                res.set("Content-Type", 'application/json').status(200).json(finalRes).end();
            });
        }
    }
});

module.exports = router;