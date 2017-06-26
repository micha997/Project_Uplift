//module hinzufügen
const express=require("express");
const router=express.Router();
const bodyParser=('body-parser');

const ressourceName = "bewertung";

// beispiel get funktion
router.get('/',function(req,res){
res.send("Alle bewertungen")
});

//modul zu app hinzufügen
module.exports=router; 