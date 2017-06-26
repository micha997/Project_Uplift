//module 
const express = require('express');
var app = express();

//Settings festlegen
const settings = {
	port: 3773
};


//bewertung �ber Pfad holen
const bewertung = require('./bewertung');
app.use("/bewertung",bewertung);

//equipment �ber Pfad holen
const equipment = require('./equipment');
app.use("/equipment",equipment);

//faveroute �ber Pfad holen
const favroute = require('./favroute');
app.use("/favroute",favroute);

//route �ber Pfad holen
const route = require('./route');
app.use("/route",routes);

//routetoequipment �ber Pfad holen
const routetoequipment = require('./routetoequipment');
app.use("/routetoequipment",routetoequipment);


//Server starten
app.listen(settings.port,function(){
	console.log("Dr Server l�uft auf Port "+ settings.port);
});
