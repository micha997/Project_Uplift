
var fs = require('fs');
var chalk = require('chalk');

fs.readFile(__dirname+"/staedte.json", function(err,data){
        var staedte = JSON.parse(data);

        for(var i = 0;i < staedte.cities.length;i++){
                console.log("name: "+chalk.green(staedte.cities[i].name));
                console.log("country: "+chalk.yellow(staedte.cities[i].country));
                console.log("population: "+chalk.red(staedte.cities[i].population));
                console.log("\n--------------------\n");
        }

        staedte.cities.sort(function(a,b){
                if(a.population>b.population){ return -1; }
                else if(a.population<b.population){ return 1; }
                else{ return 0; }
        });

        fs.writeFile(__dirname+"staedte_sortiert.json", JSON.stringify(staedte), function(err) {
                if(err) throw err;
                console.log("The file has been saved!");

                console.log("\n\n<<<>>>>>><<<<<<>>>\nSortierte Ausgabe:\n<<<>>>>>><<<<<<>>>\n");

                fs.readFile(__dirname+"/staedte_sortiert.json", function(err,data){
                        for(var i = 0;i < staedte.cities.length;i++){
                                console.log("name: "+chalk.blue(staedte.cities[i].name));
                                console.log("country: "+chalk.blue(staedte.cities[i].country));
                                console.log("population: "+chalk.blue(staedte.cities[i].population));
                                console.log("\n--------------------\n");
                        };
                });
        });
});
