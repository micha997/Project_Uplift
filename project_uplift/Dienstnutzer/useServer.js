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

server.listen(settings.Port, function(){
  console.log("Faye Pub/Sub verfuegbar unter Port: "+settings.Port);
});