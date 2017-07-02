const express=require("express");
const router=express.Router();
const bodyParser=require('body-parser');
const Ajv = require('ajv');

const ressourceName = "favequipment";

//ID Variable fuer die zu erstellenden FavEquip-Listen
var favequipID = 0;

//JSON Validation Schema fuer FavEquipment
var postSchema = {
    "title" : "favequipment",
    "description" : "Validating post/put favequipment",
    "type" : "object",
    "properties" : {
        "equipments" : {
            "type" : "array",
            "minItems" : 1,
            "items" : {
                "title" : "equipments",
                "description" : "favequipment post/put schema",
                "type" : "object",
                "properties" : {
                    "equipID" : {"type" : "integer"}
                },
                "required" : ["equipID"],
                "additionalProperties": false
            }
        }
    }
};

//Middleware
router.use(function timelog (req, res, next){
	console.log('Time: ', Date.now());
	next();
});
//Gibt alle favequipment-Listen aus
router.get('/',function(req,res){
    res.set("Content-Type", 'application/json').status(200).json(data.favequips).end();
});

//Gibt die favequipt-Liste mit der jeweiligen ID aus
router.get('/:id',function(req,res){
    //Der Parameter des gesuchten Equipment
    var reqID = parseInt(req.params.id);
    if(isNaN(reqID) || reqID < 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        //Index der FavEquipment-Liste, dass man sucht wird im Array gesucht
        var reqFavEquip = data.favequips.findIndex(function(x){ return x.id === reqID });
        if(reqFavEquip > -1){
            //Bei Erfolgreiche gefundenem Index wird die favequip-liste ausgegeben
            res.set("Content-Type", 'application/json').status(200).json(data.favequips[reqFavEquip]).end();
        }else{
            //Kein Index gefunden => gesuchtefavequip-liste nicht vorhanden => not found
            res.set("Content-Type", 'application/json').status(404).end();
        }
    }
});

//Einer favequip-liste ein neues equipment oder mehrere hinzufuegen
router.put('/:id',bodyParser.json(),function(req,res){
  //Parameter fuer die FavEquip-Liste, die veraendert werden soll
    var reqID = parseInt(req.params.id);
    var contentType = req.get('Content-Type');
    if(contentType != "application/json"){
         res.set("Accepts", "application/json").status(406).end();
    }else{
        var addFavEquip = req.body;
        var ajv = Ajv({allErrors: true});
        //Pruefen ob die Parameter stimmen und ob die json valide ist
        if(isNaN(reqID) || reqID < 0 || !ajv.validate(postSchema, addFavEquip)){ 
            res.set("Content-Type", 'application/json').status(400).end(); 
        }else{
            //Index der zu aendernden FavEquip-Liste wird gesucht
            var foundID = data.favequips.findIndex(function(x){ return x.id === reqID });
            if(foundID > -1){
                //Index der FavEquip-Liste gefunden, jetzt wird sie geaendert
                for(var i = 0;addFavEquip.equipments.length > i;i++){
                    data.favequips[foundID].equipments.push(addFavEquip.equipments[i]);
                }
                console.log(data.favequips[foundID]);
                res.set("Content-Type", 'application/json').status(201).json(data.favequips[foundID]).end();
            }else{
                //keine FavEquip-Liste mit der passenden ID gefunden => not found
                res.set("Content-Type", 'application/json').status(404).end();
            }
        }
    }
});

//Neue favequip-liste anlegen
router.post('/',bodyParser.json(),function(req,res){
  //Content-Type des Headers pruefen
   var contentType = req.get('Content-Type');
   if(contentType != "application/json"){
        res.set("Accepts", "application/json").status(406).end();
   }else{
        var newFavEquip = req.body;
        //Alle Errors der Validation sammeln, standard ist return nach erstem
        var ajv = Ajv({allErrors: true});
        if (ajv.validate(postSchema, newFavEquip)) {
            console.log(ajv.validate(postSchema, newFavEquip));
            //json Daten stimmen dem schema ueberein
            //Vergabe der ID an neue FavEquips-Liste und pushen auf das Array
            newFavEquip.id = favequipID++;
            data.favequips.push(newFavEquip);
            console.log(newFavEquip);
            res.set("Content-Type", 'application/json').set("Location", "/favequipment/" + (favequipID - 1)).status(201).json(newFavEquip).end();
        } else {
            res.set("Content-Type", 'application/json').status(400).end();
        }
   }
});

//Bestimmte favequipment-liste loeschen
router.delete('/:id',function(req,res){
  var reqID = parseInt(req.params.id);
    
    //Pruefen ob der Parameter stimmt
    if(isNaN(reqID) || reqID < 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        var foundID = data.favequips.findIndex(function(x){ return x.id === reqID });
        if(foundID > -1){
            //Index des FavEquips gefunden, wird jetzt geloescht
            var removedFavEquip = data.favequips.splice(foundID, 1);
            console.log(removedFavEquip);
            res.set("Content-Type", 'application/json').status(200).end();
        }else{
            res.set("Content-Type", 'application/json').status(404).end();
        }        
    }
});

module.exports=router;
