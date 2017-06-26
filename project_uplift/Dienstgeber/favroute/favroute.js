const express=require('express');
const app = express.Router();
const bodyParser=require('body-parser');

const ressourceName = "user";

app.post('/', function(req,res){
   
    var contentTyp = req.get('Content-Type');
    
    if(contentTyp != "application/json"){
        res.set("Accepts", "application/json").status(406).end();
    }else{
        var newFavRoute = req.body;
        //Weiter bearbeitung der json
        
        
        res.set("Content-Type", 'application/json').set("Location", "/favroute/").status(201).json(newFavRoute).end();
    }
});

module.exports = app;