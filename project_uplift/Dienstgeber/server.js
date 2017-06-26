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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
app.listen(settings.port, function () {
   console.log("REST-Sever lÃ¤uft auf Port " + settings.port);
});
=======
app.listen(settings.port,function(){
	console.log("Dr Server läuft auf Port "+ settings.port);
});
>>>>>>> 5a284afd56fc47f92e3b90e249ab60677f632cc5
=======
app.listen(settings.port,function(){
	console.log("Dr Server läuft auf Port "+ settings.port);
});
>>>>>>> 5a284afd56fc47f92e3b90e249ab60677f632cc5
=======
app.listen(settings.port,function(){
	console.log("Dr Server läuft auf Port "+ settings.port);
});
>>>>>>> 7394c15c7c4037c9db0fea238df158bdd29c6e4f
