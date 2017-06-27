const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser')

const ressourceName = "favroute";

//ID Variable fuer die zu erstellenden FavRouten
var favrouteID = 0;

//Middleware
router.use(function timelog (req, res, next){
	console.log('Time: ', Date.now());
	next();
});

router.post('/', bodyParser.json(), function(req,res){
   //Content-Type des Headers pruefen
   var contentType = req.get('Content-Type');
   if(contentType != "application/json"){
        res.set("Accepts", "application/json").status(406).end();
   }else{
        //JSON VALIDIEREN!!!!
        var newFavRoute = req.body;
        //Vergabe der ID an neue FavRoute
        newFavRoute.id = favrouteID++;
        
        data.favroutes.push(newFavRoute);
        console.log(newFavRoute);
        res.set("Content-Type", 'application/json').set("Location", "/favroute/" + (favrouteID - 1)).status(201).json(newFavRoute).end();
   }
});

router.put('/:id', bodyParser.json(), function(req, res){
    var reqID = parseInt(req.params.id);
    
    var contentType = req.get('Content-Type');
    if(contentType != "application/json"){
         res.set("Accepts", "application/json").status(406).end();
    }else{
        //JSON VALIDIEREN!!!! 
        var changeFavRoute = req.body;
        
        //Pruefen ob der Parameter stimmt
        if(isNaN(reqID) && reqID >= 0){ 
            res.set("Content-Type", 'application/json').status(400).end(); 
        }else{
            for(var i=0;i<data.favroutes.length;i++){
                if(reqID == data.favroutes[i].id){
                    //Ersetzen der Route mit einer Neuen/Bearbeiteten
                    changeFavRoute.id = reqID;
                    data.favroutes[i] = changeFavRoute;
                    console.log(data.favroutes[i]);
                    res.set("Content-Type", 'application/json').status(201).json(data.favroutes[i]).end();   
                }
            }
        }
        //data.favroutes.push(newFavRoute);
        //res.set("Content-Type", 'application/json').status(201).json(newFavRoute).end();
    }
});

router.get('/:id', function(req, res){
    var reqID = parseInt(req.params.id);
    
    //Pruefen ob der Parameter stimmt
    if(isNaN(reqID) && reqID >= 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        //Daten werden gefiltert
        var reqRoute = data.favroutes.filter(function(x){ return x.id == reqID });
        //Check ob reRoute leer ist!!!
        if(reqRoute.length === 0){ 
            res.set("Content-Type", 'application/json').status(404).end(); 
        }else{
            //ABFRAGE AN DEUTSCHE BAHN !!!
            console.log(reqRoute);
            res.set("Content-Type", 'application/json').status(200).json(reqRoute).end();    
        }
    }
	//res.send("GET Hello World!"+reqID);
});

router.delete('/:id', function(req, res){
	var reqID = parseInt(req.params.id);
    
    //Pruefen ob der Parameter stimmt
    if(isNaN(reqID) && reqID >= 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        //Schleife, um die FavRoute mit der passenden ID zu finden
        for(var i=0;i<data.favroutes.length;i++){
            if(reqID == data.favroutes[i].id){
                var removedRoute = data.favroutes.splice(i, 1);
            }
        }
        //Wenn nichts zum entfernen gefunden wurde
        if(removedRoute == null){ 
            res.set("Content-Type", 'application/json').status(404).end(); 
        }else{
            //Erfolgreich ein Objekt entfernt
            console.log(removedRoute);
            res.set("Content-Type", 'application/json').status(200).end();
        }        
    }
});

module.exports = router;