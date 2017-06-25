const express = require('express');
const bodyParser = require('body-parser');

var app = express();

const settings = {
    port: 3773
};


app.use(bodyParser.json());
//Pfad fuer Favroute Funktionen
app.use('/favroute', require('./ressourcen/favroute'));

//Weitere Funktioenen


//Server starten
app.listen(setting.port, function () {
   console.log("REST-Sever läuft auf Port " + settings.port);
});