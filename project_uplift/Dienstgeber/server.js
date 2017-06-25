const express = require('express');

var app = express();

const settings = {
    port: 3773
};

//Pfad fuer Favroute Funktionen
app.use('/favroute', require('./ressourcen/favroute'));

//Weitere Funktioenen


//Server starten
app.listen(setting.port, function () {
   console.log("REST-Sever läuft auf Port " + settings.port);
});