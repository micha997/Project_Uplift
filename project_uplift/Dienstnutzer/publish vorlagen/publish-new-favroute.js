const faye = require('faye');

var client = new faye.Client('http://localhost:8000/faye');

var newFavroute = {
	"stations":[
      {
         "id":3330,
         "gleis":2
      },
      {
         "id":3320,
         "gleis":10
      },
      {
         "id":2410,
         "gleis":1
      }
   ]
}

client.publish('/favroute', newFavroute );