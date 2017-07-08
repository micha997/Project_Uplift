var express = require('express'),
    http = require('http'),
    request = require('request'),
	faye = require('faye');

var app = express();
var server = http.createServer(app);

const settings = {
	serverPort: 8080,
	fayePort: 8000
};

var bayeux = new faye.NodeAdapter({
	mount: '/'
});

bayeux.attach(server);

app.use('/favroute', require('./routes/favroute'));

app.listen(settings.serverPort,function(){
  console.log("Dienstnutzer verfuegbar unter Port: "+settings.serverPort);
});

server.listen(settings.fayePort, function(){
  console.log("Faye Pub/Sub verfuegbar unter Port: "+settings.fayePort);
});
