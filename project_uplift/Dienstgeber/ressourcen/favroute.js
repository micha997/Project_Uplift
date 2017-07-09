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

//Hinweis: Post/Put funktionieren sehr aehnlich und haben fast den selben code
//Wegen Zeitmangel haben wir keine effizientere Loesung schreiben koennen
//Der Versuch ein paar Funktionen auszulagern hat schwierigkeiten mit den Parametern gemacht
//Deswegen folgen leider die etwas gross geratenen post/put funktionen 

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
            
            //Funktion, die den curl-request versendet
            function sendRequest(n, callback){
                console.log('Sende Request: ', n);
                //URL anpassen
                var currentOptions = options;
                currentOptions.url = ("https://api.deutschebahn.com/fasta/v1/stations/" + newFavRoute.stations[n].id);
                console.log("request an: " + currentOptions.url);
                //curl-request an die Deutsche Bahn api mit den passenden Optionen
                curl.request(currentOptions, function(err, dbDaten){
                    var dbDaten = JSON.parse(dbDaten);
                    if(err != null || typeof dbDaten.stationnumber == 'undefined'){
                        callback(true);
                    }else{
                        //Name der Station aus den erhaltenen Daten
                        newFavRoute.stations[n].name = dbDaten.name;
                        //Array mit dem Equipment fuer die Station mit passendem Gleis
                        var equipment = []
                        //Schleife zum pushen des Equipments auf das equipment Array
                        for(var j = 0; j < dbDaten.facilities.length; j++) {
                            //Pruefen ob Equipment auf dem jeweiligen Gleis vorhanden ist
                            if(dbDaten.facilities[j].description != null){
                                if(dbDaten.facilities[j].description.indexOf(newFavRoute.stations[n].gleis.toString()) >= 0){
                                    equipment.push(dbDaten.facilities[j].equipmentnumber);
                                }
                            }
                        }
                        newFavRoute.stations[n].equipment = equipment;
                        callback(null);
                    }
                });
            };
            
            //Aufruf der async Funktion timesSeries, zum seriellen Abarbeiten der curl-requests
            async.timesSeries(newFavRoute.stations.length, sendRequest, function (err, results){
                //Wenn alle Abfragen bearbeitet wurden und eine Response erstellt wurde
                console.log("Done!");
                //err ist true wenn einer aufgetreten ist
                if(err){
                    res.set("Accepts", "application/json").status(403).end();
                }else{
                    //Vergabe der ID an neue FavRoute
                    newFavRoute.id = favrouteID++;
                    data.favroutes.push(newFavRoute);
                    res.set("Content-Type", 'application/json').set("Location", "/favroute/" + (favrouteID - 1)).status(201).json(data.favroutes[favrouteID-1]).end();
                }
            });
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
                changeFavRoute.id = reqID;
            
                //Funktion, die den curl-request versendet
                function sendRequest(n, callback){
                    console.log('Sende Request: ', n);
                    //URL anpassen
                    var currentOptions = options;
                    currentOptions.url = ("https://api.deutschebahn.com/fasta/v1/stations/" + changeFavRoute.stations[n].id);
                    console.log("request an: " + currentOptions.url);
                    //curl-request an die Deutsche Bahn api mit den passenden Optionen
                    curl.request(currentOptions, function(err, dbDaten){
                        var dbDaten = JSON.parse(dbDaten);
                        if(err != null || typeof dbDaten.stationnumber == 'undefined'){
                            callback(true);
                        }else{
                            //Name der Station aus den erhaltenen Daten
                            changeFavRoute.stations[n].name = dbDaten.name;
                            //Array mit dem Equipment fuer die Station mit passendem Gleis
                            var equipment = []
                            //Schleife zum pushen des Equipments auf das equipment Array
                            for(var j = 0; j < dbDaten.facilities.length; j++) {
                                //Pruefen ob Equipment auf dem jeweiligen Gleis vorhanden ist
                                if(dbDaten.facilities[j].description != null){
                                if(dbDaten.facilities[j].description.indexOf(changeFavRoute.stations[n].gleis.toString()) >= 0){
                                    equipment.push(dbDaten.facilities[j].equipmentnumber);
                                }
                            }
                            }
                            changeFavRoute.stations[n].equipment = equipment;
                            callback(null);
                        }
                    });
                };
            
                //Aufruf der async Funktion timesSeries, zum seriellen Abarbeiten der curl-requests
                async.timesSeries(changeFavRoute.stations.length, sendRequest, function (err, results){
                    //Wenn alle Abfragen bearbeitet wurden und eine Response erstellt wurde
                    console.log("Done!");
                    //err ist true wenn einer aufgetreten ist
                    if(err){
                        res.set("Accepts", "application/json").status(403).end();
                    }else{
                        data.favroutes[routeID] = changeFavRoute;
                        res.set("Content-Type", 'application/json').set("Location", "/favroute/" + (favrouteID - 1)).status(200).json(data.favroutes[routeID]).end();
                    }
                });
            }else{
                //keine Route mit der passenden ID gefunden => not found
                res.set("Content-Type", 'application/json').status(204).end();
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
            res.set("Content-Type", 'application/json').status(204).end();
        }        
    }
});

//Holt alle vorhandenen routen oder gefilter nach bestimmten Parametern
router.get('/', function(req, res){
    var start = parseInt(req.query.start);
    var finish = parseInt(req.query.finish);
    //Pruefen ob Parameter fuers filtern uebergeben wurden
    if(!(isNaN(start) || start < 0 || isNaN(finish) || finish < 0)){
        filterStartFinish(start, finish, req.query.sort);
    }else if(isNaN(start) || start < 0 || isNaN(finish) || finish < 0){
        var reqRoute = data.favroutes;
        //Sortierung des Arrays wenn Parameter gegeben
        if(req.query.sort == 'short'){ reqRoute.sort(function(a, b){ return a.stations.length - b.stations.length; }); }
        if(req.query.sort == 'long'){ reqRoute.sort(function(a, b){ return b.stations.length - a.stations.length; }); }
        res.set("Content-Type", 'application/json').status(200).json(reqRoute).end();
    }
    
    function filterStartFinish(start, finish, sort){
            //Routen, die mit der Start und Finish Station uebereinstimmen werden gesucht
            var reqRoute = data.favroutes.filter(function(x){ return x.stations[0].id == start
                                                                  && x.stations[x.stations.length-1].id == finish});
            if(reqRoute.length > 0){
                //Bei Erfolgreiche gefundenem Index wird die FavRoute ausgegeben
                //Sortierung des Arrays wenn Parameter gegeben
                if(sort == 'short'){ reqRoute.sort(function(a, b){ return a.stations.length - b.stations.length; }); }
                if(req.query.sort == 'long'){ reqRoute.sort(function(a, b){ return b.stations.length - a.stations.length; }); }
                res.set("Content-Type", 'application/json').status(200).json(reqRoute).end();
            }else{
                //Kein Index gefunden => gesuchte FavRoute nicht vorhanden => not found
                res.set("Content-Type", 'application/json').status(404).end();
            }
        };
});

//Evtl nuetzlich
//Object.keys(req.query).length !== 0

module.exports = router;