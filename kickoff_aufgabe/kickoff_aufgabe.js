var fs = require('fs');
var chalk = require('chalk');

fs.readFile(__dirname+"/staedte.json", function(err,data){
	var staedte = JSON.parse(data);
	
	for(var i = 0;i < staedte.cities.length;i++){
		console.log("name: "+chalk.blue(staedte.cities[i].name));
		console.log("country: "+chalk.green(staedte.cities[i].country));
		console.log("population: "+chalk.yellow(staedte.cities[i].population));
		console.log("\n--------------------\n");	
	}
});
