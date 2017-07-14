const faye = require('faye');

var client = new faye.Client('http://localhost:8000/faye');

var newFavroute = {
	"Operation" : 'DELETE'
}

client.publish('/favroute/0', newFavroute );