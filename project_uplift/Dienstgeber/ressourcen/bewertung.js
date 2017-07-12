const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const Ajv = require('ajv'); //Fuer das validieren der json posts
//Evtl fuer optionale weitere Parameter
//require path-to-regexp
//const pathToRegexp = require('path-to-regexp');

const ressourceName = "bewertung";

//JSON Validation Schema fuer bewertung
var postSchema = {
    "title" : "bewertungen",
    "description" : "Validating post bewertung",
    "type" : "object",
    "properties" : {
        "wertung" : {"type" : "integer"},
        "comment" : {"type" : "string"}
    },
    "required": [ "wertung", "comment" ],
    "additionalProperties": false    
};

//Middleware
router.use(function timelog (req, res, next){
    console.log('-----------------------');
	console.log('Time: ', Date.now());
    console.log('Method: ',req.method);
    console.log('URL: ',ressourceName + req.url);
	next();
});

//Gibt alle Bewertungen von allen Equipments aus, die im Array data.bewertung liegen
//gefiltert nach Parametern wenn gegeben
router.get('/', bodyParser.json(), function(req, res){
    var reqBewertung = data.bewertung;
    
    //Sortieren nach besten-bewerteten zu erst
    if(req.query.sort == 'top'){ reqBewertung.sort(function(a, b){ return b.gesamtWertung - a.gesamtWertung;});}
    
    //Sortieren nach schlecht-bewerteten zu erst
    if(req.query.sort == 'low'){ reqBewertung.sort(function(a, b){ return a.gesamtWertung - b.gesamtWertung;});}
           
    res.set("Content-Type", 'application/json').status(200).json(reqBewertung).end();
});

//Gibt einem die Bewertungen fuer ein bestimmtes Equipment aus
router.get('/:equipID', bodyParser.json(), function(req, res){
    //Der Parameter des gesuchten Equipment
    var equipID = parseInt(req.params.equipID);
    if(isNaN(equipID) || equipID < 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        //Index des Equipments, dass man sucht wird im Array gesucht
        var reqEquip = data.bewertung.findIndex(function(x){ return x.equipID === equipID });
        if(reqEquip > -1){
            //Bei Erfolgreiche gefundenem Index werden die Bewertungen ausgegeben
            res.set("Content-Type", 'application/json').status(200).json(data.bewertung[reqEquip].bewertungen).end();
        }else{
            //Kein Index gefunden => gesuchtes Equipment hat keine Bewertungen => not found
            res.set("Content-Type", 'application/json').status(404).end();
        }
    }
});

router.post('/:equipID', bodyParser.json(), function(req,res){
    //Parameter des Equipment, dem man die Bewertung zuordnet
    var equipID = parseInt(req.params.equipID);
    var contentType = req.get('Content-Type');
    if(contentType != "application/json"){
         res.set("Accepts", "application/json").status(406).end();
    }else{
         var newBewertung = req.body;
         //Alle Errors der Validation sammeln, standard ist return nach erstem
         var ajv = Ajv({allErrors: true});
        //Pruefen ob Parameter eine Zahl ist und groesser 0 und pruefen ob die json Daten valide sind
         if(isNaN(equipID) || equipID < 0 || !ajv.validate(postSchema, newBewertung)){ 
             res.set("Content-Type", 'application/json').status(400).end();
         }else{
             //Suche der EquipmentID
             var foundEquipID = data.bewertung.findIndex(function(x){ return x.equipID === equipID });
             //console.log(foundEquipID);
             if(foundEquipID > -1){
                 //Es wurde eine EquipmentID im Array gefunden und die neue Bewertung wird hinzugefuegt
                 newBewertung.id = data.bewertung[foundEquipID].bewertungID++; //ID vergabe
                 data.bewertung[foundEquipID].gesamtWertung += newBewertung.wertung; //gesamtWertung anpassen
                 data.bewertung[foundEquipID].bewertungen.push(newBewertung);
                 //console.log(data.bewertung);
                 res.set("Content-Type", 'application/json').set("Location", "/bewertung/" + equipID).set("BewertungID", (data.bewertung[foundEquipID].bewertungID - 1)).status(201).json(newBewertung).end();
             }else{
                 //Es wurde keine EquipmentID gefunden 
                 //=> Noch keine Bewertungen fuer diese Equipment vorhanden
                 //=> Neuer Eintrag wird fuer das Equipment erstellt und die Bewertung hinzugefuegt
                 var newEintrag = {
                     "bewertungen": [],
                     "equipID" : 0,
                     "gesamtWertung" : 0,
                     "bewertungID" : 0
                 };
                 newBewertung.id = newEintrag.bewertungID++; //ID-Vergabe an die einzelne Bewertung
                 newEintrag.gesamtWertung += newBewertung.wertung; //gesamtWertung wird angepasst
                 newEintrag.bewertungen.push(newBewertung); //Bewertung wird an den Eintrag gepusht
                 newEintrag.equipID = equipID;
                 //Eintrag mit erster Bewertung wird dem Haupt-Array(data.bewertung) hinzugefuegt
                 data.bewertung.push(newEintrag);
                 //console.log(data.bewertung);
                 res.set("Content-Type", 'application/json').set("Location", "/bewertung/" + equipID + "/" + (newEintrag.bewertungID-1)).status(201).json(newEintrag).end();
             }
         }
    }
});

//1. Loescht alle Bewertungen eines Equipments 
//2. Loescht eine bestimmte Bewertung eines Equipments
router.delete('/:equipID', bodyParser.json(), function(req, res){
    //Die ID des Equipments
    var equipID = parseInt(req.params.equipID);
    if(isNaN(equipID) || equipID < 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        //Bei beiden Faellen wird man den Index des Equipments mit den Bewertungen suchen 
        var foundEquipID = data.bewertung.findIndex(function(x){ return x.equipID === equipID });
        if(foundEquipID > -1){
            //Switch-Case fuer zwei Faelle
            //1. Eine bestimmte Bewertung eines Equipments loeschen, wenn Parameter gegeben sind
            //2. Alle Bewertungen eines Equipments loeschen
            switch(Object.keys(req.query).length !== 0){
                case true:
                    var query = parseInt(req.query.id);
                    var foundBewertungID = data.bewertung[foundEquipID].bewertungen.findIndex(function(x){ return x.id === query });
                    if(foundBewertungID > -1){
                        //Bewertung des Equipment gefunden
                        //gesamtWertung muss angepasst werden, durch das Entfernen der Bewertung
                        data.bewertung[foundEquipID].gesamtWertung -= data.bewertung[foundEquipID].bewertungen[foundBewertungID].wertung;
                        var removedBewertung = data.bewertung[foundEquipID].bewertungen.splice(foundBewertungID, 1);
                        //console.log(removedBewertung);
                        //console.log(data.bewertung);
                        res.set("Content-Type", 'application/json').status(200).end();
                    }else{
                        //Bewertung zum entfernen nicht vorhanden ist
                        res.set("Content-Type", 'application/json').status(204).end();
                    }
                    break;
                case false:
                    //ID gefunden => Entfernen der Equipment-Bewertungen (Alle)
                    var removedEquipment = data.bewertung.splice(foundEquipID, 1);
                    //console.log(removedEquipment);
                    //console.log(data.bewertung);
                    res.set("Content-Type", 'application/json').status(200).end();
                    break;
                                                  }
        }else{
            //ID nicht gefunden => not found
            res.set("Content-Type", 'application/json').status(204).end();
        }  
    }
});

module.exports = router;