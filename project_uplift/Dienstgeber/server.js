//module 
const express = require('express');
var app = express();

//Settings festlegen
const settings = {
	port: 3773
};


//bewertung über Pfad holen
const bewertung = require('./bewertung');
app.use("/bewertung",bewertung);

//equipment über Pfad holen
const equipment = require('./equipment');
app.use("/equipment",equipment);

//faveroute über Pfad holen
const favroute = require('./favroute');
app.use("/favroute",favroute);

//route über Pfad holen
const route = require('./route');
app.use("/route",routes);

//routetoequipment über Pfad holen
const routetoequipment = require('./routetoequipment');
app.use("/routetoequipment",routetoequipment);


//Server starten
app.listen(settings.port,function(){
	console.log("Dr Server läuft auf Port "+ settings.port);
});
