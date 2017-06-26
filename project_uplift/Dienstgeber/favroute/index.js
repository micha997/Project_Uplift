//module hinzufügen
const express=require("express");
const router=express.Router();
const bodyParser=('body-parser');

const ressourceName = "favroute";

// beispiel get funktion
router.get('/',function(req,res){
res.send("Alle favroutes")
});

//modul zu app hinzufügen
module.exports=router; 
