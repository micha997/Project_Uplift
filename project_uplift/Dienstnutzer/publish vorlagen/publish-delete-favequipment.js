const faye = require('faye');

var client = new faye.Client('http://localhost:8000/faye');

var newFavEquip = {
	  "Operation": 'DELETE'
   }

client.publish('/favequipment/0', newFavEquip );