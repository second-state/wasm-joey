// System
//File system
const fs = require('fs');
// HTTPS
const https = require('https');
const privateKey = fs.readFileSync('/etc/letsencrypt/live/rpc.ssvm.secondstate.io/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/rpc.ssvm.secondstate.io/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/rpc.ssvm.secondstate.io/fullchain.pem', 'utf8');
const helmet = require("helmet");
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};
// Express
const express = require('express');
const app = express();
app.use(helmet());
// Body parser
var bodyParser = require('body-parser');
app.use(bodyParser.text());
// Config
require('dotenv').config();
//Port
const port = process.env.port;
// Data ser/des
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
// CORS
var cors = require('cors');
app.use(cors());
// Database
console.log("Connecting to database, please wait ... ");
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name
});
connection.connect((err) => {
    if (err) throw err;
    console.log('Connection to database succeeded!');
});
// Filtering the content types which are allowed to access Joey
console.log("\n");
const regex = RegExp(/[^application\/(?:octet-stream|json)|^plain\/text])(?:[\s;]|$)/i);
app.use(function(req, res, next) {
  if (req.method === 'POST' && !regex.test(req.headers['content-type']))
    return res.send(406);
  next();
});
// SSVM
//var ssvm = require('ssvm-napi');

/* Startup */
// Serve
https.createServer(credentials, app).listen(port, process.env.host, () => {
    console.log(`Welcome to wasm-joey` + '\nHost:' + process.env.host + '\nPort: ' + port);
    console.log("Reading database configuration, please wait ... ");
    console.log("Database host: " + process.env.db_host);
    console.log("Database port: " + process.env.db_port);
    console.log("Database name: " + process.env.db_name);
    console.log("Database user: " + process.env.db_user);
    console.log("\n");
});
/* End Startup*/

/* Utils */
function removeElementFromArray(arr, value) {
    return arr.filter(function(ele) {
        return ele != value;
    });
}

function performSqlQuery(string_query) {
    return new Promise(function(resolve, reject) {
        connection.query(string_query, function(err, resultSelect) {
            if (err) {
                res.status(400).send("Perhaps a bad request, or database is not running");
            }
            console.log("Result of select: " + resultSelect.length);
            resolve(resultSelect);
        });
    });
}
/* Utils end */

/* RESTful endpoints */
app.get('/', (req, res) => {
    json_response = [{
        "application": "wasm_joey"
    }, {
        "usage:": "https://github.com/second-state/wasm-joey/blob/master/documentation/usage.md"
    }];
    res.send(JSON.stringify(json_response));
});

// Set a Wasm executable
app.post('/api/executables', bodyParser.text(), (req, res) => {
    console.log("Request to set a new wasm hex into the database ...");
    if (req.is('text/plain') == 'text/plain') {
        console.log("Stringified body is: " + req.body);
        var sqlInsert = "INSERT INTO wasm_executables (wasm_description,wasm_hex) VALUES ('" + req.header('SSVM-Description') + "','" + req.body + "');";
    } else if (req.is('application/octet-stream' == 'application/octet-stream')) {
        console.log("Wasm is in binary/asm format");
        // work out if we want to convert to hex here
        var sqlInsert = "INSERT INTO wasm_executables (wasm_description,wasm_binary) VALUES ('" + req.header('SSVM-Description') + "','" + req.body + "');";
    } else {
        json_response["error"] = "Wasm file must be hex (using xxd etc.) and have Content-Type in header set to text/plain 0x \n OR \n Wasm must be in binary format and have Content-Type in header set to application/octet-stream.";
    }
    console.log(sqlInsert);
    connection.query(sqlInsert, function(err, resultInsert) {
        if (err) {
            res.status(400).send("Perhaps a bad request, or database is not running");
        }
        console.log("1 record inserted at wasm_id: " + resultInsert.insertId);

        const json_response = {
            "wasm_id": resultInsert.insertId
        };
        console.log(JSON.stringify(json_response));
        res.send(JSON.stringify(json_response));
    });

});

// Get a Wasm executable
app.get('/api/executables/:wasm_id', (req, res) => {
    var valid_filters = ["wasm_id", "wasm_description", "wasm_as_hex", "wasm_as_buffer"];
    var request_validity = true;
    var json_response = {};
    if (req.query.filterBy != undefined) {
        // filters include wasm_id, wasm_description, wasm_as_hex, wasm_as_buffer
        var filters = JSON.parse(req.query.filterBy);
        if (filters.length >= 1) {
            for (var i = 0; i < filters.length; i++) {
                if (!valid_filters.includes(filters[i])) {
                    console.log(filters[i] + " is NOT a valid filter ...");
                    request_validity = false;
                } else {
                    console.log(filters[i] + " is a valid filter ...");
                }
            }
            if (request_validity == false) {
                res.send(JSON.stringify([{
                    "error_invalid_filter": JSON.stringify(filters)
                }, {
                    "valid_filters_include": valid_filters
                }]));
            } else {
                if (filters.length >= 1) {
                    if (filters.includes("wasm_as_hex")) {
                        filters = removeElementFromArray(filters, "wasm_as_hex");
                        var sqlSelect = "SELECT wasm_hex from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                        console.log(sqlSelect);
                        performSqlQuery(sqlSelect).then((result) => {
                            json_response["wasm_as_hex"] = result[0].wasm_hex;
                            console.log(JSON.stringify("2" + JSON.stringify(json_response)));
                            if (filters.length == 0) {
                                res.send(JSON.stringify(json_response));
                            }
                        });
                    }
                }
                if (filters.length >= 1) {
                    if (filters.includes("wasm_as_buffer")) {
                        filters = removeElementFromArray(filters, "wasm_as_buffer");
                        var sqlSelect = "SELECT wasm_hex from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                        console.log(sqlSelect);
                        performSqlQuery(sqlSelect).then((result) => {
                            var new_buffer = Buffer.from(result[0].wasm_hex);
                            json_response["wasm_as_buffer"] = new_buffer;
                            console.log(JSON.stringify("3" + JSON.stringify(json_response)));
                            if (filters.length == 0) {
                                res.send(JSON.stringify(json_response));
                            }
                        });
                    }
                }
                if (filters.length >= 1) {
                    var sqlSelect = "SELECT " + filters.join() + " from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                    console.log("SQL with filters.join()\n" + sqlSelect);
                    performSqlQuery(sqlSelect).then((result) => {
                        json_response["wasm_id"] = result[0].wasm_id;
                        json_response["wasm_description"] = result[0].wasm_description;
                        console.log(JSON.stringify("4" + JSON.stringify(json_response)));
                        filters = [];
                        if (filters.length == 0) {
                            res.send(JSON.stringify(json_response));
                        }
                    });
                }
            }
        }
    } else {
        console.log("No filters");
        var sqlSelect = "SELECT * from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
        console.log(sqlSelect);
        performSqlQuery(sqlSelect).then((result) => {
            json_response["wasm_id"] = result[0].wasm_id;
            json_response["wasm_description"] = result[0].wasm_description;
            json_response["wasm_as_hex"] = result[0].wasm_hex;
            var new_buffer = Buffer.from(result[0].wasm_hex);
            json_response["wasm_as_buffer"] = new_buffer;
            res.send(JSON.stringify(json_response));
        });
    }

});

// Get all Wasm executable
app.get('/api/executables', (req, res) => {
    var sqlSelectAllIds = "SELECT wasm_id from wasm_executables;";
    performSqlQuery(sqlSelectAllIds).then((result) => {
        res.send(JSON.stringify(result));
    });
});

app.put('/api/executables/:wasm_id', (req, res) => {
    var sqlUpdate = "UPDATE wasm_executables SET wasm_hex = '" + req.body["wasm_hex"] + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
    console.log(sqlUpdate);
    performSqlQuery(sqlUpdate).then((result) => {
        const json_response = {
            "wasm_id": req.params.wasm_id
        };
        console.log(JSON.stringify(json_response));
        res.send(JSON.stringify(json_response));
    });
});

app.delete('/api/executables/:wasm_id', (req, res) => {
    var sqlDelete = "DELETE from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
    console.log(sqlDelete);
    performSqlQuery(sqlDelete).then((result) => {
        const json_response = {
            "wasm_id": req.params.wasm_id
        };
        console.log(JSON.stringify(json_response));
        res.send(JSON.stringify(json_response));
    });
});

/* Running Wasm Functions */
//
//
// Run a function belonging to a Wasm executable -> returns a JSON string
app.post('/api/run/:wasm_id/:function_name', (req, res) => {
    var json_response = {};
    // Need to qualify that this is the correct Content-Type and send an error message to the caller if they have it incorrect
    console.log("Checking request Content-Type: " + req.is('application/json'));
    var sqlSelect = "SELECT wasm_hex from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
    performSqlQuery(sqlSelect).then((result, error) => {
        var raw_data = result[0].wasm_hex.toJSON();
        var wasm_as_buffer = Uint8Array.from(raw_data.data);
        //var vm = new ssvm.VM(wasm_as_buffer);
        var function_name = req.params.function_name;
        console.log("Function name: " + function_name);
        try {
            var function_parameters = req.body;
        } catch (err) {
            json_response["error"] = err;
            res.send(JSON.stringify(json_response));
        }
        var function_parameters_as_string = JSON.stringify(function_parameters);
        console.log(function_parameters_as_string);
        // This is the new way in which vm.RunString will be called i.e. passing in the entire body of parameters to ssvm, which hands it over the the Rust/Wasm function to deal parse/interpret 
        //var return_value = vm.RunString(function_name, function_parameters_as_string); 
        //json_response["return_value"] = return_value;
        res.send(JSON.stringify(json_response));
    });
});

// Run a function belonging to a Wasm executable -> returns a Buffer
app.post('/api/run/:wasm_id/:function_name/bytes', (req, res) => {
    // Need to qualify that this is the correct Content-Type and send an error message to the caller if they have it incorrect
    console.log("Checking request Content-Type: " + req.is('application/octet-stream'));
    var sqlSelect = "SELECT wasm_hex from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
    performSqlQuery(sqlSelect).then((result, error) => {
        console.log("Request body: " + req.body);
        var raw_data = result[0].wasm_hex.toJSON();
        var wasm_as_buffer = Uint8Array.from(raw_data.data);
        //var vm = new ssvm.VM(wasm_as_buffer);
        var function_name = req.params.function_name;
        var body_as_buffer = Uint8Array.from(req.body);
        console.log("Body as buffer: " + body_as_buffer);
        //var return_value = vm.RunUint8Array(function_name, body_as_buffer); 
        //res.send(new Buffer(return_value, 'binary'));
        res.contentType('application/octet-stream');
        res.send(Buffer.from([1, 2, 3, 4, 5, 6], 'binary')); // Delete this line, it is just for testing whilst ssvm is being updated
    });
});
//
//
/* Running Wasm Functions */