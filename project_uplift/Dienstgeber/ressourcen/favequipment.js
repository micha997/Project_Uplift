//module hinzuf�gen
const express=require("express");
const router=express.Router();
const bodyParser=require('body-parser');
const schema = require('js-schema');
const ressourceName = "favequipment";

//id fuer die erstellten favequipment-listen
var favequipid = 0;


var EquipSchema = schema({
  id : Number,
  equipments : Array
});

//Middleware
router.use(function timelog (req, res, next){
	console.log('Time: ', Date.now());
	next();
});
/*beispiel get funktion
router.get('/',function(req,res){
res.send("Alle favequipments + funktionalitaet")
});*/

router.get('/:id',function(req,res){
//id wird gespeichert
  var reqID= parseInt(req.params.id);
  //Parameter ueberpruefen
  if(isNaN(reqID)&&reqID>=0){
    res.set("Content-Type",'application/json').status(400).end();
  }else{
    //Daten mit Eintrag reqID werden herausgefiltert
    var reqEquip=data.favequips.filter(function(x){return x.id==reqID});
    //ueberpruefen ob liste leer ist
    if(reqEquip.length===0){
      res.set("Content-Type", 'application/json').status(404).end();
    }else{
      //Abfrage Deutsche Bahn
      console.log(reqEquip);
      res.set("Content-Type", 'application/json').status(200).json(reqEquip).end();
    }
  }
});

router.put('/:id',bodyParser.json(),function(req,res){
  var reqID= parseInt(req.params.id);
  var contentType = req.get('Content-Type');
    if(contentType != "application/json"){
      res.set("Accepts", "application/json").status(406).end();
    }else{
      //JSON validieren?!
      var changeFavEquip=req.body;
      //Parameter ueberpruefen
			console.log( EquipSchema(changeFavEquip) );
			if(!EquipSchema(changeFavEquip) ){
				res.set("Content-Type", 'application/json').status(400).end();
			}
			else{
	      if(isNaN(reqID) && reqID >= 0){
	        res.set("Content-Type", 'application/json').status(400).end();
	      }else{
	        for(var i=0;i<data.favequips.length;i++){
	          if(reqID == data.favequips[i].id){
	            //Ersetzen der Equipmentliste mit einer aktuellen
	            changeFavEquip.id = reqID;
	            data.favequips[i] = changeFavEquip;
	            console.log(data.favequips[i]);
	            res.set("Content-Type", 'application/json').status(201).json(data.favequips[i]).end();
	          }
	        }
				}
      }
    }
});

router.post('/',bodyParser.json(),function(req,res){
  //Content-Type ueberpruefen
  var contentType = req.get('Content-Type');
  if(contentType != "application/json"){
    res.set("Accepts", "application/json").status(406).end();
  }else{
    //Json validieren?!
    var newFavEquip = req.body;
		console.log( EquipSchema(newFavEquip) );
		if(!EquipSchema(newFavEquip) ){
			res.set("Content-Type", 'application/json').status(400).end();
		}
		else{

	    //neue Id fuer neuen Eintrag
	    newFavEquip.id = favequipid++;
	    data.favequips.push(newFavEquip);
	    console.log(newFavEquip);
	    res.set("Content-Type", 'application/json').set("Location", "/favequipment/" + (favequipid - 1)).status(201).json(newFavEquip).end();
	  }
	}
});

router.delete('/:id',function(req,res){
  var reqID= parseInt(req.params.id);
  if(isNaN(reqID)&&reqID>=0){
    res.set("Content-Type",'application/json').status(400).end();
  }else{
    //favequipmentliste mit der gewuenschten id suchen
    for(var i=0;i<data.favequips.length;i++){
      if(reqID == data.favequips[i].id){
        var removedEquip = data.favequips.splice(i, 1);
      }
    }
    //id nicht gefunden
    if(removedEquip == null){
      res.set("Content-Type", 'application/json').status(404).end();
    }else{
    //Erfolgreich ein Objekt entfernt
      console.log(removedEquip);
      res.set("Content-Type", 'application/json').status(200).end();
    }
  }
});

//modul zu app hinzuf�gen
module.exports=router;
