//const joey_instance = "rpc.ssvm.secondstate.io";
// Joey development instanance
const joey_instance = "dev.rpc.ssvm.secondstate.io";

// Set up environment
const https = require('https');
var fs = require('fs');


function executeExecutablesIntFunction() {
    var id_to_use = 65;
    console.log("\x1b[32m", "Processing: executeExecutablesIntFunction() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/run/' + id_to_use + '/double',
                'headers': {
                    'Content-Type': 'text/plain',
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    console.log("END");
                    var body = Buffer.concat(chunks);
                    console.log(body.toString());
                    resolve();
                });
                res.on("error", function(error) {
                    console.error("Error: " + error);
                    resolve();
                });
            });
            var postData = 22;
            console.log(typeof postData);
            req.write(postData);
            console.log("asdf");
            req.end();
        } catch {
            reject();
        }
    });
}

executeExecutablesIntFunction().then((executeExecutablesIntFunctionResult) => {
console.log(executeExecutablesIntFunctionResult);});
