//Start a Server
var http = require('http'),
    faye = require('faye');

var server = http.createServer(),
    bayeux = new faye.NodeAdapter({mount: '/'});

bayeux.attach(server);
server.listen(8000);




//Create a client
var client = new Faye.Client('http://localhost:8000/');

//FavRoute
client.subscribe('/favroute/:favRouteNumber/Bewertung', function(message) {
  console.log('Got a message: ' + message.text);
});


client.publish('/favroute/:favRouteNumber/Bewertung', {
  text: 'Für ein Equipment auf der favRoute wurde eine Bewertung hinzugefügt'
});



client.subscribe('/favroute/:favRouteNumber/Change', function(message) {
  console.log('Got a message: ' + message.text);
});


client.publish('/favroute/:favRouteNumber/Change', {
  text: 'Die Route wurde verändert'
});






//FavEquipment
client.subscribe('/favequipment/:favequipmentnumber', function(message) {
  console.log('Got a message: ' + message.text);
});


client.publish('/favequipment/:favequipmentnumber', {
  text: 'Für ein Equipment auf der FaveEquipmentliste wurde eine Bewertung hinzugefügt'
});



client.subscribe('/favequipment/:favequipmentnumber/change', function(message) {
  console.log('Got a message: ' + message.text);
});


client.publish('/favequipment/:favequipmentnumber/change', {
  text: 'Ein Equipment wurde hinzugefuegt/gelöscht'
});



//Bewertung SUB
client.subscribe('/bewertung/:equipmentnumber', function(message) {
  console.log('Got a message: ' + message.text);
});

client.subscribe('/bewertung/:equipmentnumber/:bid', function(message) {
  console.log('Got a message: ' + message.text);
});


//Send Messages PUB
client.publish('/bewertung/:equipmentnumber', {
  text: 'Eine neue Bewertung wurde hinzugefügt' 
});

client.publish('/bewertung/:equipmentnumber/:bid', {
  text: 'Eine Bewertung wurde geändert'
});
