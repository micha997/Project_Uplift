//module hinzufügen
const express=require("express");
const router=express.Router();
const bodyParser=('body-parser');

const ressourceName = "routetoequipment";

// beispiel get funktion
router.get('/',function(req,res){
res.send("Route zum gewählten equipment")
});

//modul zu app hinzufügen
module.exports=router; 