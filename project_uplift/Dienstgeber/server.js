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

//
//Versucht es so ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//

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
app.use("/route",route);

//routetoequipment �ber Pfad holen
const routetoequipment = require('./routetoequipment');
app.use("/routetoequipment",routetoequipment);


//Server starten
app.listen(settings.port, function () {
   console.log("REST-Sever laeuft auf Port " + settings.port);
});
