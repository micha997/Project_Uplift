var express = require('express'),
    http = require('http'),
    request = require('request');

var app = express();

var dHost = 'http://localhost';//muss noch auf Heroku geaendert werden
var dPort = 3773;
var dURL = dHost + ":" + dPort;

/*GET-REQUESTS*/
app.get('/favroute', function(req,res){

  var url = dURL+'/favroute';

  request.get(url,function(err,response,body){
    body=JSON.parse(body);
    res.json(body);
  });
});

app.get('/favequipment', function(req,res){

  var url = dURL+'/favequipment';

  request.get(url,function(err,response,body){
    body=JSON.parse(body);
    res.json(body);
  });
});

app.get('/bewertung', function(req,res){

  var url = dURL+'/bewertung';

  request.get(url,function(err,response,body){
    body=JSON.parse(body);
    res.json(body);
  });
});

app.get('/favroute/:id', function(req,res){

  var favrouteid = req.params.id;
  var url = dURL+'/favroute/'+favrouteid;

  request.get(url,function(err,response,body){
    body=JSON.parse(body);
    res.json(body);
  });
});

app.get('/favequipment/:id', function(req,res){

  var favequipmentid = req.params.id;
  var url = dURL+'/favequipment/'+favequipmentid;

  request.get(url,function(err,response,body){
    body=JSON.parse(body);
    res.json(body);
  });
});

app.get('/bewertung/:id/', function(req,res){

  var equipmentid = req.params.id;
  var url = dURL+'/bewertung/'+equipmentid;

  request.get(url,function(err,response,body){
    body=JSON.parse(body);
    res.json(body);
  });
});
/*POST-REQUESTS*/
app.post('/favroute',function(req,res){

  var favrouteData = {
	"stations": [
		{
			"id": 3330,
			"gleis": 3
		},
		{
			"id": 2410,
			"gleis": 4
		},
		{
			"id": 3330,
			"gleis": 4
		},
		{
			"id": 2410,
			"gleis": 4
		}
	 ]
  };
    var url = (dURL + '/favroute');
    var options = {
    uri: url,
    method: 'POST',
    headers:{
        'Content-Type': 'application/json'
    },
    json: favrouteData
  };
    request.post(options,function(err,response,body){
    res.json(body);
   });
 });

app.post('/favequipment',function(req,res){

   var favequipmentData = {
        "equipments": [
            {
                "equipID": 3336
            },
            {
                "equipID": 3221
            },
            {
                "equipID": 3223
            }
        ],
        "id" : 0
    };
     var url = (dURL + '/favequipment');
     var options = {
     uri: url,
     method: 'POST',
     headers:{
         'Content-Type': 'application/json'
     },
     json: favequipmentData
   };
     request.post(options,function(err,response,body){
     res.json(body);
    });
  });

app.post('/bewertung/:id',function(req,res){
  var equipid = req.params.id;

  var bewertungData =  {
    "wertung" : 5,
    "comment" : "Lauft ganz gut"
  };
  var url = (dURL + '/bewertung/'+equipid);
  var options = {
    uri: url,
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    json: bewertungData
  };
  request.post(options,function(err,response,body){
    res.json(body);
  });
});
/*PUT-REQUESTS*/
app.put('/favroute/:id',function(req,res){

  var favrouteData = {
	"stations": [
		{
			"id": 3330,
			"gleis": 3
		},
		{
			"id": 2410,
			"gleis": 4
		},
		{
			"id": 3330,
			"gleis": 4
		},
		{
			"id": 2410,
			"gleis": 4
		}
	 ]
  };
  var favrouteid = req.params.id;
  var url = dURL+'/favroute/'+favrouteid;
  var options = {
    uri: url,
    method: 'PUT',
    headers:{
        'Content-Type': 'application/json'
    },
    json: favrouteData
  };
  request.put(options,function(err,response,body){
    res.json(body);
  });
});

app.put('/favequipment/:id',function(req,res){

  var favequipmentData = {
        "equipments": [
            {
                "equipID": 3336
            },
            {
                "equipID": 3221
            },
            {
                "equipID": 3223
            }
        ],
        "id" : 0
      };
  var favequipmentid = req.params.id;
  var url = dURL+'/favequipment/'+favequipmentid;
  var options = {
    uri: url,
    method: 'PUT',
    headers:{
        'Content-Type': 'application/json'
    },
    json: favequipmentData
  };
  request.put(options,function(err,response,body){
    res.json(body);
  });
});

/*DELETE-REQUESTST*/
app.delete('/favroute/:id', function(req,res){

  var favrouteid = req.params.id;
  var url = dURL+'/favroute/'+favrouteid;

  request.delete(url,function(err,response,body){
    body=JSON.parse(body);
    res.json(body);
  });
});

app.delete('/favequipment/:id', function(req,res){

  var favequipmentid = req.params.id;
  var url = dURL+'/favequipment/'+favequipmentid;

  request.delete(url,function(err,response,body){
    res.end();
  });
});

app.delete('/bewertung/:eid/:bid', function(req,res){

  var equipmentid = req.params.eid;
  var bewertungid = req.params.bid;
  var url = dURL+'/bewertung/'+equipmentid+"/"+bewertungid;

  request.delete(url,function(err,response,body){
    res.end();
  });
});

app.delete('/bewertung/:id', function(req,res){

  var equipmentid = req.params.id;
  var url = dURL+'/bewertung/'+equipmentid;

  request.delete(url,function(err,response,body){
    res.end();
  });
});

app.listen(3774,function(){
  console.log("Dienstnutzer ist nun auf Port 3774 verfügbar");
});
