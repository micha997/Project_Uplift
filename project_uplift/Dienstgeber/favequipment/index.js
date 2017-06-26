//module hinzufügen
const express=require("express");
const router=express.Router();
const bodyParser=('body-parser');

const ressourceName = "favequipment";

// beispiel get funktion
router.get('/',function(req,res){
res.send("Alle favequipments")
});

//modul zu app hinzufügen
module.exports=router; 