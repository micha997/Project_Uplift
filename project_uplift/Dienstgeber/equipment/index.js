//module hinzuf�gen
const express=require("express");
const router=express.Router();
const bodyParser=('body-parser');

const ressourceName = "equipment";

// beispiel get funktion
router.get('/',function(req,res){
res.send("Alle equipments in der n�he")
});

//modul zu app hinzuf�gen
module.exports=router; 