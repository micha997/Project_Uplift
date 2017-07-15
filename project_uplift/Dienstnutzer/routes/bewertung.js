var faye = require('faye');
var http = require('http');
var request = require('request');

const useName = "bewertung";

var dgHost = 'https://wba2-mrh-dienstgeber.herokuapp.com' || 'http://localhost:3773';

//Create a client
var clientFaye = new faye.Client('http://localhost:8000/');

clientFaye.subscribe('/bewertung/*').withChannel(function(channel, message){
    //Die Equipmentnummer wird aus dem Topic extrahiert
    var channelArr = channel.match(/\d+/g);
    var channelNum = parseInt(channelArr[0]);
    var bewertungData = message;
    //Optionen fuer den Request an den Dienstgeber werden angepasst
    var url = (dgHost + '/bewertung/'+channelNum);
    var options = {
        uri: url,
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        json: bewertungData
    };
    request.post(options,function(err,response,body){
        if(response.statusCode == 201){ console.log("Bewertung erstellt!"); }
    });
});