var http = require('http'),
	faye = require('faye');

var server = http.createServer();

const settings = {
	Port: 8000
};

var bayeux = new faye.NodeAdapter({
	mount: '/'
});

bayeux.attach(server);

const favroute = require('./routes/favroute');
const favequipment = require('./routes/favequipment');
const bewertung = require('./routes/bewertung');


server.listen(settings.Port, function(){
  console.log("Faye Pub/Sub verfuegbar unter Port: "+settings.Port);
});