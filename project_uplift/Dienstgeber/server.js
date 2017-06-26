//module 
const express = require('express');
var app = express();

//Settings festlegen
const settings = {
	port: 3773
};

//faveroute über Pfad holen
const favroutes = require('./favroute');
app.use("/favroute",favroutes);


//Server starten
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
