const faye = require('faye');

var client = new faye.Client('http://localhost:8000/faye');

var bewertung1 = {
	'wertung' : -1,
	'comment' : 'Mist'
}

client.publish('/bewertung/10099507', bewertung1 );