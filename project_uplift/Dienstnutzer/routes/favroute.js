var faye = require('faye');
var http = require('http');
var request = require('request');
var async = require('async');
var curl = require('curlrequest');

const useName = "favroute";

var clientFaye = new faye.Client("http://localhost:8000");

var dgHost = 'https://wba2-mrh-dienstgeber.herokuapp.com' || 'http://localhost:3773';

//Optionen fuer die curl-anfrage an die Deutsche Bahn
var DBoptions =
    {
        url : "https://api.deutschebahn.com/fasta/v1/facilities/",
        method : 'GET',
        headers :
        {
        Accept : "application/json",
		Authorization: "Bearer  1017fb6c771d14ad25f3f1abc1b2758c"
        }
    };

//Subscribe zu den Bewertungen zum pruefen ob bei einer der Favroutes die EquipID vorhanden ist
clientFaye.subscribe('/bewertung/*').withChannel(function(channel, message){
    //Die Equipmentnummer wird aus dem Topic extrahiert
    var channelArr = channel.match(/\d+/g);
    var channelNum = parseInt(channelArr[0]);
    
    //Die erhaltene Message wird verpackt fuer einen potentielen Publish
    var newBewertung = 
        {
            'equipID': channelNum,
            'wertung': message.wertung,
            'comment': message.comment
        };
    
    //Pruefen ob es publish-wuerdig ist (wertung = schlecht)
    //Wenn es Wuerdig ist dann besorgt man sich die favroutes vom dienstgeber
    //und prueft ob einer der Routen eines dieser Equipments hat
    //Wenn ja dann wird auf dem topic dieser favroute gepublishet
	if(message.wertung < 0){
		async.waterfall([
			function(callback){
				//Array der FavrouteIDs an die am Ende gepublisht wird 
				var publishTo = [];
				var url = dgHost +'/favroute'
				request.get(url,function(err,response,body){
					if(response.statusCode == 200){
						resBody=JSON.parse(body);
						//Ab hier wird geprueft ob eine der Routen das jeweiige Equipment enthaelt
						for(var i = 0;i<resBody.length;i++){
							for(var j = 0;j<resBody[i].stations.length;j++){
								for(var k = 0;k<resBody[i].stations[j].equipment.length;k++){
									if(resBody[i].stations[j].equipment[k].equipID == channelNum){
										//Es wurde eine FavRoute mit diesem Equipment gefunden
										//ID der FavRoute wird ins Array hinzugefuegt
										publishTo.push(resBody[i].id);
									}
								}
							}
						}
					}
					callback(null, publishTo);
				});
			},
			function(publishTo, callback){
				//Wenn es Routen mit diesem Equipment gibt
				if(publishTo.length > 0){
					//URL anpassen fuer Deutsche Bahn Anfrage
					var currentOptions = DBoptions;
					currentOptions.url = ("https://api.deutschebahn.com/fasta/v1/facilities/" + channelNum);
					//curl-request an die Deutsche Bahn API mit den passenden Optionen
					curl.request(currentOptions, function(err, dbDaten){
						var dbDaten = JSON.parse(dbDaten);
						if(err == null && typeof dbDaten.stationnumber != 'undefined'){
							//Den offizielle Status des Equipments an die Publish-Nachricht haengen
							newBewertung.currentState = dbDaten.state;
							newBewertung.EquipmentTyp = dbDaten.type;
						}
						callback(null, publishTo);
					});
				}
			}
		],function(err, publishTo){
			//An jedes Topic mit den IDs publishen
			for(var i = 0;i<publishTo.length;i++){
				var pubPath = '/favroute/' + publishTo[i] + '/bewertung';
				console.log("Publish bewertung on FavRoute: " + pubPath);
				clientFaye.publish(pubPath,newBewertung);
			}
		});
	}     
});

//Subscribe auf favroute
clientFaye.subscribe('/favroute', function(message){
	//Kanal fuer den spaeteren Publish
	//"/favroute/{start-stationID}/{end-stationID}"
    var pubPath = '/favroute/'+ message.stations[0].id + '/' + message.stations[message.stations.length-1].id;
	
    //URL fuer den http-request an den Dienstgeber
    var postURL = dgHost + '/favroute/';
    
    //Optionen fuer das POST-request
    var postOptions = {
        url: postURL,
        method: 'POST',
        json: message,
        headers: {
            'Content-Type' : 'application/json'
        }
    }
	
	//Request an Dienstgeber starten
    request(postOptions, function(err, response, body){        
        //Wenn es erfolgreich auf den Dienstgeber gepostet wurden
		//dann wird ein Piblish durchgefuehrt auf dem Topic
		//"/favroute/{start-stationID}/{end-stationID}"
		if(response.statusCode == 201){
            var ressLocation = dgHost + response.headers.location;
			
			console.log("Publish new FavRoute: " + pubPath);
			
            var publishing = clientFaye.publish(pubPath, {
                'Operation' : 'POST',
                'Ressource' : ressLocation
            });
        }
    });
});

//Subscribe auf favroute bei PUT und DELETE Ausfuehrungen
clientFaye.subscribe('/favroute/*').withChannel(function(channel, message){
	
	//Die FavRouteID wird aus dem Topic extrahiert
    var channelArr = channel.match(/\d+/g);
    var channelNum = parseInt(channelArr[0]);
	
	var operation = message.Operation;
	delete message.Operation;
	
	//Path fuer Publish
    var pubPath = '/favroute/' + channelNum + '/change';
	
    //URL fuer den http-request an unseren Dienstgeber
    var URL = dgHost + '/favroute/' + channelNum;
    
    //Optionen fuer das PUT/DELETE
    var Options = {
        url: URL,
        method: operation,
        json: message,
        headers: {
            'Content-Type' : 'application/json'
        }
    }
	
	//Request an Dienstgeber starten
    request(Options, function(err, response, body){        
        if(response.statusCode == 200){
        
            var ressLocation = URL;
			
			console.log("Publish change on FavRoute: " + pubPath);

            var publishing = clientFaye.publish(pubPath, {
                'Operation' : operation,
                'Ressource' : ressLocation
            });
        }
    });
});