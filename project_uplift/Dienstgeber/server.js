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
app.listen(settings.port,function(){
	console.log("Dr Server läuft auf Port "+ settings.port);
});
