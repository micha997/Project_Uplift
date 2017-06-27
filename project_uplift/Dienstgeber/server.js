//module 
const express = require('express');

var app = express();
//var bodyParser = require('body-parser');

global.data = require('./ressourcen/data');

//Settings festlegen
const settings = {
	port: 3773
};

//app.use(bodyParser.json());

//favequipment ueber Pfad holen
const favequipment= require('./ressourcen/favequipment');
app.use("/favequipment",favequipment);

//faveroute ueber Pfad holen
const favroute = require('./ressourcen/favroute');
app.use("/favroute", favroute);
//
//Versucht es so ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//

//bewertung ueber Pfad holen
const bewertung = require('./bewertung');
app.use("/bewertung",bewertung);

//equipment ueber Pfad holen
const equipment = require('./equipment');
app.use("/equipment",equipment);

//faveroute ueber Pfad holen
//const favroute = require('./favroute');
//app.use("/favroute",favroute);


//favequipment ueber Pfad holen
//const favequipment= require('./favequipment');
//app.use("/favequipment",favequipment);

//route ueber Pfad holen
const route = require('./route');
app.use("/route",route);

//routetoequipment ueber Pfad holen
const routetoequipment = require('./routetoequipment');
app.use("/routetoequipment",routetoequipment);


//Server starten
app.listen(settings.port, function () {
   console.log("REST-Sever laeuft auf Port " + settings.port);
});