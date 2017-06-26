//module 
const express = require('express');
const bodyParser = require('body-parser')

var app = express();

//Settings festlegen
const settings = {
	port: 3773
};

app.use(bodyParser.json());

//faveroute ueber Pfad holen
app.use("/favroute",require('./ressourcen/favroute'));

//Server starten
app.listen(settings.port, function () {
   console.log("REST-Sever läuft auf Port " + settings.port);
});
