var faye = require('faye');
var http = require('http');
var request = require('request');
var async = require('async');
var curl = require('curlrequest');

const useName = "favequipment";


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

//Create a client
var clientFaye = new faye.Client('http://localhost:8000/');

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
    //Wenn es Wuerdig ist dann besorgt man sich die favequipment-listen vom dienstgeber
    //und prueft ob auf einer der listen eine dieser Equipments ist
    //Wenn ja dann wird auf dem topic dieser favequipment-liste gepublisht
	if(message.wertung < 0){
		async.waterfall([
			function(callback){
				//Array der FavEquipmentIDs an die am Ende gepublisht wird 
				var publishTo = [];
				var url = dgHost +'/favequipment'
				request.get(url,function(err,response,body){
					if(response.statusCode == 200){
						resBody=JSON.parse(body);
						//Ab hier wird geprueft ob eine der Listen das jeweiige Equipment enthaelt
						for(var i = 0;i<resBody.length;i++){
							for(var j = 0;j<resBody[i].equipments.length;j++){
                                if(resBody[i].equipments[j].equipID == channelNum){
                                    //Es wurde eine Liste mit diesem Equipment gefunden
                                    //ID der Liste wird ins Array hinzugefuegt
                                    publishTo.push(resBody[i].id);
								}
							}
						}
					}
					callback(null, publishTo);
				});
			},
			function(publishTo, callback){
				//Wenn es Listen mit diesem Equipment gibt
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
				var pubPath = '/favequipment/' + publishTo[i] + '/bewertung';
				console.log("Publish bewertung on FavEquipment: " + pubPath);
				clientFaye.publish(pubPath,newBewertung);
			}
		});
	}
});

clientFaye.subscribe('/favequipment/*').withChannel(function(channel, message) {
    var channelArr = channel.match(/\d+/g);
    var channelNum = parseInt(channelArr[0]);  
    
    var operation = message.Operation;
	delete message.Operation;
	
	//Path fuer Publish
    var pubPath = '/favequipment/' + channelNum + '/change';
	
    //URL fuer den http-request an unseren Dienstgeber
    var URL = dgHost + '/favequipment/' + channelNum;
    
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
			
			console.log("Publish change on FavEquipment: " + pubPath);

            var publishing = clientFaye.publish(pubPath, {
                'Operation' : operation,
                'Ressource' : ressLocation
            });
        }
    });
});

clientFaye.subscribe('/favequipment',function(message){	
    //URL fuer den http-request an den Dienstgeber
    var postURL = dgHost + '/favequipment/';
    
    //Path fuer Publish
    var pubPath = '/favequipment/';
    
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
		//dann wird ein Publish durchgefuehrt auf dem Topic
		//"/favequipment/"
		if(response.statusCode == 201){
            var ressLocation = dgHost + response.headers.location;
			
            console.log("Publish new FavEquipment: " + pubPath);
			
            var publishing = clientFaye.publish(pubPath, {
                'Operation' : 'POST',
                'Ressource' : ressLocation
            });
        }
    });
});