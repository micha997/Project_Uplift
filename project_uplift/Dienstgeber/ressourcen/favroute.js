const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const curl = require('curlrequest');
const async = require('async');

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
        //JSON VALIDIEREN!!!!
        var newFavRoute = req.body;
        //Vergabe der ID an neue FavRoute
        newFavRoute.id = favrouteID++;
        
        data.favroutes.push(newFavRoute);
        console.log(newFavRoute);
        res.set("Content-Type", 'application/json').set("Location", "/favroute/" + (favrouteID - 1)).status(201).json(newFavRoute).end();
   }
});

router.put('/:id', bodyParser.json(), function(req, res){
    var reqID = parseInt(req.params.id);
    
    var contentType = req.get('Content-Type');
    if(contentType != "application/json"){
         res.set("Accepts", "application/json").status(406).end();
    }else{
        //JSON VALIDIEREN!!!! 
        var changeFavRoute = req.body;
        
        //Pruefen ob der Parameter stimmt
        if(isNaN(reqID) && reqID >= 0){ 
            res.set("Content-Type", 'application/json').status(400).end(); 
        }else{
            for(var i=0;i<data.favroutes.length;i++){
                if(reqID == data.favroutes[i].id){
                    //Ersetzen der Route mit einer Neuen/Bearbeiteten
                    changeFavRoute.id = reqID;
                    data.favroutes[i] = changeFavRoute;
                    console.log(data.favroutes[i]);
                    res.set("Content-Type", 'application/json').status(201).json(data.favroutes[i]).end();   
                }
            }
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
        //Daten werden gefiltert, !!schlechte loesung!!  aa = bb = cc ! FILTER ONE ITEM ONLY
        var reqRouteArr = data.favroutes.filter(function(x){ return x.id == reqID });
        var reqRoute = reqRouteArr[0];
        
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
                //Request wird gestartet und die Optionen werden mituebergeben
                sendRequest(currentOptions, function(err){
                    console.log("Erledigt?");
                    done(err);
                });
            };
            
            //Funktion, die den curl-request versendet
            function sendRequest(currentOptions, callback){
                //curl-request an die Deutsche Bahn api mit den passenden Optionen
                curl.request(currentOptions, function(err, dbDaten){
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
                        
                        //NUR WENN GLEIS PASST ABFRAGE NOCH HINZUFUEGEN!
                        
                        var equip1 ={
                            "equipmentTyp" : dbDaten.facilities[j].type,
                            "beschreibung" : dbDaten.facilities[j].description,
                            "status" : dbDaten.facilities[j].state
                        }
                        newStation.equipment.push(equip1);
                    }
                    finalRes.push(newStation);
                    console.log("Added " + finalRes);
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

module.exports = router;