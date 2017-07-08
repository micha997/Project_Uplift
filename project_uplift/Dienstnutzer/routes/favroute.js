var express = require('express'),
	router = express.Router(),
    http = require('http'),
    request = require('request'),
	faye = require('faye'),
    async = require('async'),
    curl = require('curlrequest'),
	bodyParser = require('body-parser');

const useName = "favroute";

var clientFaye = new faye.Client("http://localhost:8000");

var dgHost = 'http://localhost:3773';//muss noch auf Heroku geaendert werden

//Optionen fuer die curl-anfrage an die Deutsche Bahn
var DBoptions =
    {
        url : "https://api.deutschebahn.com/fasta/v1/stations/",
        method : 'GET',
        headers :
        {
        Accept : "application/json",
		Authorization: "Bearer  1017fb6c771d14ad25f3f1abc1b2758c"
        }
    };

//Bsp Methode mit publish
router.get('/', function(req,res){
	
    var path = '/favroute';

    var publishing = clientFaye.publish(path,{'Name':"DatName",
    'Numba':12});
  
    var url = dgHost+'/favroute';

    request.get(url,function(err,response,body){
        resBody=JSON.parse(body);
        res.json(resBody);
    });
});

router.post('/', bodyParser.json(), function(req,res){    
    //JSON Body
    var newFavRoute = req.body;
    
    //Path fuer Publish
    var pubPath = '/favroute'; //newFavroute.stations[0].id/newFavroute.stations[newFavroute.stations.length-1].id;
    
    //URL fuer den http-request an unseren Dienstgeber
    var postURL = dgHost + '/favroute/';
    
    //Optionen fuer das POST
    var postOptions = {
        url: postURL,
        method: 'POST',
        json: newFavRoute,
        headers: {
            'Content-Type' : 'application/json'
        }
    }
    
    //Request an Dienstgeber starten
    request(postOptions, function(err, response, body){        
        if(response.statusCode == 201){
        
            var ressLocation = dgHost + response.headers.location;

            var publishing = clientFaye.publish(pubPath, {
                'Operation' : 'POST',
                'Ressource' : ressLocation
            });
        
            //Erfolgreich erstellt
            res.set("Content-Type", 'application/json').status(201).end();
        }else if(response.statusCode == 406){
            //Falsches Format
            res.set("Content-Type", 'application/json').status(406).end();
        }else if(response.statusCode == 400 || err){
            //Error
            res.set("Content-Type", 'application/json').status(400).end();
        }else if(response.statusCode == 403){
            //Problem beim nutzten des externen WebService beim Dienstgeber
            res.set("Content-Type", 'application/json').status(403).end();
        }
    });
});

router.put('/:id', bodyParser.json(), function(req,res){
    //Ressource ID
    var putID = req.params.id;
    
    //JSON Body
    var newFavRoute = req.body;
    
    //Path fuer Publish
    var pubPath = '/favroute'; //+ putID + '/change';
    
    //URL fuer den http-request an unseren Dienstgeber
    var putURL = dgHost + '/favroute/' + putID;
    
    //Optionen fuer das PUT
    var putOptions = {
        url: putURL,
        method: 'PUT',
        json: newFavRoute,
        headers: {
            'Content-Type' : 'application/json'
        }
    }
    
    //Request an Dienstgeber starten
    request(putOptions, function(err, response, body){
        if(response.statusCode == 200){
            var publishing = clientFaye.publish(pubPath, {
                'Operation' : 'PUT',
                'Ressource' : putURL
            });
            //Erfolgreich geaendert
            res.set("Content-Type", 'application/json').status(200).end();
        }else if(response.statusCode == 204){
            //No content to put
            res.set("Content-Type", 'application/json').status(204).end();
        }else if(response.statusCode == 400 || err){
            //Error
            res.set("Content-Type", 'application/json').status(400).end();
        }else if(response.statusCode == 406){
            //Format falsch
            res.set("Content-Type", 'application/json').status(406).end();
        }else if(response.statusCode == 403){
            //Problem beim nutzten des externen WebService beim Dienstgeber
            res.set("Content-Type", 'application/json').status(403).end();
        }
    });
});

router.get('/:id', function(req,res){
    //Ressource ID
    var getID = req.params.id;
    
    //URL fuer den http-request an unseren Dienstgeber
    var getURL = dgHost + '/favroute/' + getID;
    
    //Request an Dienstgeber starten
    request.get(getURL, function(err, response, body){
        if(response.statusCode == 200){
            var reqBody = JSON.parse(body);
            //Erfolgreich geholt
            
            //=> Aktuelle Informationen von der Deutschen Bahn holen
            
            //Funktion, die den curl-request versendet
            function sendRequest(n, callback){
                console.log('Sende Request: ', n);
                //URL anpassen
                var currentOptions = DBoptions;
                currentOptions.url = ("https://api.deutschebahn.com/fasta/v1/stations/" + reqBody.stations[n].id);
                console.log("request an: " + currentOptions.url);
                //curl-request an die Deutsche Bahn api mit den passenden Optionen
                curl.request(currentOptions, function(err, dbDaten){
                    var dbDaten = JSON.parse(dbDaten);
                    //Array fuer das jeweilige Equipment an der Station
                    newEquipment = [];
                    
                    //Schleife zum pushen des Equipments auf das newStation.equipment Array
                    for(var j = 0; j < dbDaten.facilities.length; j++) {
                        //Pruefen ob Equipment auf dem jeweiligen Gleis vorhanden ist
                        if(dbDaten.facilities[j].description != null){
                            if(dbDaten.facilities[j].description.indexOf(reqBody.stations[n].gleis.toString()) >= 0){
                                var equip1 ={
                                    "equipID" : dbDaten.facilities[j].equipmentnumber,
                                    "equipmentTyp" : dbDaten.facilities[j].type,
                                    "status" : dbDaten.facilities[j].state
                                }
                                newEquipment.push(equip1);
                            }
                        }
                    }
                    reqBody.stations[n].equipment = newEquipment;
                    callback(null);
                });
            };
            
            //Aufruf der async Funktion timesSeries, zum seriellen Abarbeiten der curl-requests
            async.timesSeries(reqBody.stations.length, sendRequest, function (err, results){                
                    //Wenn alle Abfragen bearbeitet wurden und eine Response erstellt wurde
                    console.log("Done!");
                    //err ist true wenn einer aufgetreten ist
                    if(err){
                        res.set("Accepts", "application/json").status(403).end();
                    }else{
                        res.set("Content-Type", 'application/json').status(200).json(reqBody).end();
                    }
            });
        
        }else if(response.statusCode == 404){
            //Not found
            res.set("Content-Type", 'application/json').status(404).end();
        }else if(response.statusCode == 400 || err){
            //Error
            res.set("Content-Type", 'application/json').status(400).end();
        }
    });
});

router.delete('/:id', function(req,res){
    //Ressource ID
    var delID = req.params.id;
    
    //Path fuer Publish
    var pubPath = '/favroute'; //+ delID + '/change';
    
    //URL fuer den http-request an unseren Dienstgeber
    var delURL = dgHost + '/favroute/' + delID;
    
    //Request an Dienstgeber starten
    request.delete(delURL, function(err, response, body){
        if(response.statusCode == 200){
            var publishing = clientFaye.publish(pubPath, {
                'Operation' : 'DELETE',
                'Ressource' : delURL
            });
            //Erfolgreich entfernt
            res.set("Content-Type", 'application/json').status(200).end();
        }else if(response.statusCode == 204){
            //No content to delete
            res.set("Content-Type", 'application/json').status(204).end();
        }else if(response.statusCode == 400 || err){
            //Error
            res.set("Content-Type", 'application/json').status(400).end();
        }
    });
});

module.exports = router;