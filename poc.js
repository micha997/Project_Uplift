var curl = require('curlrequest')

var options =
    {
        url: "https://api.deutschebahn.com/fasta/v1/stations/3330",
        method: 'GET',
        headers:
        {
		Accept: "application/json",
		Authorization: "Bearer  1017fb6c771d14ad25f3f1abc1b2758c"
        }
    };

 
curl.request(options, function (err, data) {
	var data = JSON.parse(data);

	console.log(data.name);
	if (data.facilities.length==0) {
	console.log("Kein Equipment") } else



	for (var i=0; i < data.facilities.length; i++) {
		console.log("Der " + data.facilities[i].type + " " + data.facilities[i].description + " ist " + data.facilities[i].state);
	}
	
});

