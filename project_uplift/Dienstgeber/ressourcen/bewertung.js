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
    "additionalProperties": false,
    "anyOf": [
        { "required": [ "wertung" ] },
        { "required": [ "comment" ] },
        { "required": [ "wertung", "comment" ] }
    ]
};

//Middleware
router.use(function timelog (req, res, next){
	console.log('Time: ', Date.now());
	next();
});

//Gibt alles aus, was momentan im Array data.bewertung vorhanden ist
router.get('/', bodyParser.json(), function(req, res){
    res.set("Content-Type", 'application/json').status(200).json(data.bewertung).end();
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
             console.log(foundEquipID);
             if(foundEquipID > -1){
                 //Es wurde eine EquipmentID im Array gefunden und die neue Bewertung wird hinzugefuegt
                 newBewertung.id = data.bewertung[foundEquipID].bewertungID++;
                 data.bewertung[foundEquipID].bewertungen.push(newBewertung);
                 console.log(data.bewertung);
                 res.set("Content-Type", 'application/json').set("Location", "/bewertung/" + equipID + "/" + (data.bewertung[foundEquipID].bewertungID - 1)).status(201).json(newBewertung).end();
             }else{
                 //Es wurde keine EquipmentID gefunden 
                 //=> Noch keine Bewertungen fuer diese Equipment vorhanden
                 //=> Neuer Eintrag wird fuer das Equipment erstellt und die Bewertung hinzugefuegt
                 var newEintrag = {
                     "bewertungen": [],
                     "equipID" : 0,
                     "bewertungID" : 0
                 };
                 newBewertung.id = newEintrag.bewertungID++;
                 //Bewertung wird dem Eintrag gepusht
                 newEintrag.bewertungen.push(newBewertung);
                 newEintrag.equipID = equipID;
                 //Eintrag mit erster Bewertung wird dem Haupt-Array(data.bewertung) hinzugefuegt
                 data.bewertung.push(newEintrag);
                 console.log(data.bewertung);
                 res.set("Content-Type", 'application/json').set("Location", "/bewertung/" + equipID + "/" + (newEintrag.bewertungID-1)).status(201).json(newEintrag).end();
             }
         }
    }
});

//loeschen aller bewertungen einer Anlage/eines Equipments
router.delete('/:equipID', bodyParser.json(), function(req, res){
    //Die ID zum loeschen des Eintrags eines Equipments samt Bewertungen
    var delID = parseInt(req.params.equipID);
    if(isNaN(delID) || delID < 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        var foundEquipID = data.bewertung.findIndex(function(x){ return x.equipID === delID });
        if(foundEquipID > -1){
            //ID gefunden => Entfernen der Equipment-Bewertungen (Alle)
            var removedEquipment = data.bewertung.splice(foundEquipID, 1);
            console.log(removedEquipment);
            console.log(data.bewertung);
            res.set("Content-Type", 'application/json').status(200).end();
        }else{
            //ID nicht gefunden => not found
            res.set("Content-Type", 'application/json').status(404).end();
        }  
    }
});

//loeschen einer bestimmten bewertung einer Anlage/eines Equipments
router.delete('/:equipID/:bewertungID', bodyParser.json(), function(req, res){
    //equipID des Equipments
    var equipID = parseInt(req.params.equipID);
    //id der zu loeschenden Bewertung des jeweiligen Equipments
    var delID = parseInt(req.params.bewertungID);
    if(isNaN(delID) || delID < 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        var foundEquipID = data.bewertung.findIndex(function(x){ return x.equipID === equipID });
        if(foundEquipID > -1){
            //Equipment gefunden
            var foundBewertungID = data.bewertung[foundEquipID].bewertungen.findIndex(function(x){ return x.id === delID });
            if(foundBewertungID > -1){
                //Bewertung des Equipment gefunden
                var removedBewertung = data.bewertung[foundEquipID].bewertungen.splice(foundBewertungID, 1);
                console.log(removedBewertung);
                console.log(data.bewertung);
                res.set("Content-Type", 'application/json').status(200).end();
            }else{
                //Bewertung zum entfernen nicht vorhanden ist
                res.set("Content-Type", 'application/json').status(404).end();
            }
        }else{
            //Equipment nicht vorhanden (hat noch keine Bewertungen)
            res.set("Content-Type", 'application/json').status(404).end();
        }
    }
});

module.exports = router;