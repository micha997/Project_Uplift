//module 
const express = require('express');
const bodyParser = require('body-parser')

var app = express();

//Settings festlegen
const settings = {
	port: 3773
};

<<<<<<< HEAD
app.use(bodyParser.json());
=======

//bewertung ¸ber Pfad holen
const bewertung = require('./bewertung');
app.use("/bewertung",bewertung);

//equipment ¸ber Pfad holen
const equipment = require('./equipment');
app.use("/equipment",equipment);

//faveroute ¸ber Pfad holen
const favroute = require('./favroute');
app.use("/favroute",favroute);

//route ¸ber Pfad holen
const route = require('./route');
app.use("/route",routes);

//routetoequipment ¸ber Pfad holen
const routetoequipment = require('./routetoequipment');
app.use("/routetoequipment",routetoequipment);
>>>>>>> d3cc2d9e3ce6768cfcc6c61a04fb584eb4a96052

//faveroute ueber Pfad holen
app.use("/favroute",require('./ressourcen/favroute'));

//Server starten
app.listen(settings.port, function () {
   console.log("REST-Sever l√§uft auf Port " + settings.port);
});
