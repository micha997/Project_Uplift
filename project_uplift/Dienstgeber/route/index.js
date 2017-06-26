//module hinzufügen
const express=require("express");
const router=express.Router();
const bodyParser=('body-parser');

const ressourceName = "route";

// beispiel get funktion
router.get('/',function(req,res){
res.send("Alle euipments auf der Route");
});

//modul zu app hinzufügen
module.exports=router; 