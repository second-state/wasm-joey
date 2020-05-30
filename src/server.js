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
app.use(bodyParser.text({
    type: "text/plain",
    limit: 100000000
}));
app.use(bodyParser.json({
    type: "application/json"
}));
app.use(bodyParser.raw({
    type: "application/octet-stream",
    limit: 100000000
}));

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
app.use(function(req, res, next) {
    if (req.method === 'POST') {
        if (req.is('application/octet-stream' !== 'application/octet-stream') || req.is('application/json' !== 'application/json') || req.is('text/plain' !== 'text/plain')) {
            return res.send(406);
        }
    }
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

select unix_timestamp();

function executableExists(wasm_id) {
    return new Promise(function(resolve, reject) {
        connection.query("select wasm_id from wasm_executables where wasm_id='" + wasm_id + "';", function(err, resultSelect) {
            if (err) {
                res.status(400).send("Perhaps a bad request, or database is not running");
            }
            console.log("Result of select: " + resultSelect.length);
            resolve(resultSelect.length);
        });
    });
}

function executeCallback() {
    var https = require('follow-redirects').https;

var options = {
  'method': 'POST',
  'hostname': 'rpc.ssvm.secondstate.io',
  'port': 8081,
  'path': '/api/run/1/my_function',
  'headers': {
    'Content-Type': 'application/json'
  },
  'maxRedirects': 20
};

var req = https.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

var postData = JSON.stringify({"function_params":{"param_one":1,"param_two":"two"}});

req.write(postData);

req.end();
}
/* Utils end */

/* RESTful endpoints */
app.get('/', (req, res) => {
    json_response = [{
        "application": "wasm_joey"
    }, {
        "usage_documentation:": "https://github.com/second-state/wasm-joey/blob/master/documentation/usage.md"
    }];
    res.send(JSON.stringify(json_response));
});

// Set a Wasm executable
app.post('/api/executables', bodyParser.raw(), (req, res) => {
    json_response = {};
    console.log("Request to set a new wasm hex into the database ...");
    if (req.is('application/octet-stream') == 'application/octet-stream') {
        var wasm_as_buffer = Uint8Array.from(req.body);
        var sqlInsert = "INSERT INTO wasm_executables (wasm_description,wasm_binary, wasm_state) VALUES ('" + req.header('SSVM-Description') + "','" + wasm_as_buffer + "', ' ');";
        console.log(sqlInsert);
        performSqlQuery(sqlInsert).then((resultInsert) => {
            console.log("1 record inserted at wasm_id: " + resultInsert.insertId);
            json_response["wasm_id"] = resultInsert.insertId;
            console.log(JSON.stringify(json_response));
            res.send(JSON.stringify(json_response));

        });
    }
});

// Get a Wasm executable
app.get('/api/executables/:wasm_id', (req, res) => {
    json_response = {};
    executableExists(req.params.wasm_id).then((result, error) => {
        console.log("Result:" + result + ".");
        if (result == 1) {
            var valid_filters = ["wasm_id", "wasm_description", "wasm_as_buffer", "wasm_state"];
            var request_validity = true;
            if (req.query.filterBy != undefined) {
                var filters = JSON.parse(req.query.filterBy);
                if (filters.length == 1) {
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
                            if (filters.includes("wasm_as_buffer")) {
                                filters = removeElementFromArray(filters, "wasm_as_buffer");
                                var sqlSelect = "SELECT wasm_binary from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                                console.log(sqlSelect);
                                performSqlQuery(sqlSelect).then((result) => {
                                    json_response["wasm_as_buffer"] = result[0].wasm_binary;
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
                                json_response["wasm_state"] = result[0].wasm_state;
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
                    json_response["wasm_as_buffer"] = result[0].wasm_binary;
                    json_response["wasm_state"] = result[0].wasm_state;
                    res.send(JSON.stringify(json_response));
                });
            }
        } else {
            json_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(json_response));
        }

    });
});

// Get all Wasm executable
app.get('/api/executables', (req, res) => {
    var sqlSelectAllIds = "SELECT wasm_id from wasm_executables;";
    performSqlQuery(sqlSelectAllIds).then((result) => {
        res.send(JSON.stringify(result));
    });
});

app.put('/api/update_wasm_binary/:wasm_id', bodyParser.raw(), (req, res) => {
    json_response = {};
    executableExists(req.params.wasm_id).then((result, error) => {
        console.log("Result:" + result + ".");
        if (result == 1) {
            if (req.is('application/octet-stream') == 'application/octet-stream') {
                var wasm_as_buffer = Uint8Array.from(req.body);
                var sqlUpdate = "UPDATE wasm_executables SET wasm_binary = '" + wasm_as_buffer + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
                console.log(sqlUpdate);
                performSqlQuery(sqlUpdate).then((result) => {
                    json_response["wasm_id"] = req.params.wasm_id;
                    console.log(JSON.stringify(json_response));
                    res.send(JSON.stringify(json_response));
                });
            }
        } else {
            json_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(json_response));
        }
    });
});

app.delete('/api/executables/:wasm_id', (req, res) => {
    json_response = {};
    executableExists(req.params.wasm_id).then((result, error) => {
        console.log("Result:" + result + ".");
        if (result == 1) {
            var sqlDelete = "DELETE from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            console.log(sqlDelete);
            performSqlQuery(sqlDelete).then((result) => {
                json_response["wasm_id"] = req.params.wasm_id
                console.log(JSON.stringify(json_response));
                res.send(JSON.stringify(json_response));
            });
        } else {
            json_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(json_response));
        }
    });
});
/* Running Wasm Functions */
//
//
// Run a function belonging to a Wasm executable -> returns a JSON string
app.post('/api/run/:wasm_id/:function_name', bodyParser.json(), (req, res) => {
    var json_response = {};
    executableExists(req.params.wasm_id).then((result, error) => {
        console.log("Result:" + result + ".");
        if (result == 1) {
            console.log("Checking request Content-Type: " + req.is('application/json'));
            var sqlSelect = "SELECT wasm_binary, wasm_state from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlSelect).then((result, error) => {
                console.log(result[0].wasm_binary.data);
                //var raw_data = result[0].wasm_binary;
                var wasm_state_as_string = result[0].wasm_state;
                var wasm_as_buffer = Uint8Array.from(result[0].wasm_binary);
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
                //var vm = new ssvm.VM(wasm_as_buffer);
                //var return_value = vm.RunString(wasm_state_as_string, function_name, function_parameters_as_string);
                /*
                The Rust / Wasm application is allowed to optionally generate a callback object and merge the callback object into the response. 
                Joey must check each response from the RunString execution and process a callback object if it is present.
                The following is a temporary example, which will be commented out when SSVM is complete and able to send back JSON string
                */
                // Fictitious return value for development and testing purposes
                return_value = `{
                                "data_from_ssvm": {
                                    "function": {
                                        "name": "new template name"
                                    },
                                    "callback": {
                                        "url": "https://api.sendgrid.com/v3/",
                                        "method": "POST",
                                        "headers": [{
                                            "Content-Type": "application/json"
                                        }, {
                                            "Authorization": "Bearer key_goes_here"
                                        }]
                                    }
                                }
                            }`
                var return_value_as_object = JSON.parse(return_value);
                if (return_value_as_object.data_from_ssvm.hasOwnProperty('callback')){
                    console.log("Processing callback");
                    } else {
                    // This code will need to parse the actual return data once ssvm-napi is released
                    json_response["return_value"] = return_value_as_object.data_from_ssvm.function;
                    res.send(JSON.stringify(json_response));
                    }
                
                //json_response["return_value"] = return_value;
                res.send(JSON.stringify(json_response));
            });
        } else {
            console.log("Error processing bytes for function: " + function_name + " for Wasm executable with wasm_id: " + req.params.wasm_id);
            res.end();
        }
    });
});

// Run a function belonging to a Wasm executable -> returns a Buffer
// This endpoint calls vm.RunUint8Array which returns a Uint8Array,
// Each of these endpoints can only accept one type of data as the body i.e. the middleware can only parse raw OR json OR plain.,
// For this reason, this function will accept a Uint8Array from the caller (as the body). This makes the most sense because (sending receiving Uint8Array).
app.post('/api/run/:wasm_id/:function_name/bytes', bodyParser.raw(), (req, res) => {
    json_response = {};
    executableExists(req.params.wasm_id).then((result, error) => {
        console.log("Result:" + result + ".");
        if (result == 1) {
            console.log("Checking content type ...");
            // Setting response type
            res.set('Content-Type', 'application/octet-stream')
            if (req.is('application/octet-stream') == 'application/octet-stream') {
                var sqlSelect = "SELECT wasm_binary, wasm_state from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                performSqlQuery(sqlSelect).then((result, error) => {
                    var wasm_state_as_string = result[0].wasm_state;
                    var wasm_as_buffer = Uint8Array.from(result[0].wasm_binary);
                    //var vm = new ssvm.VM(wasm_as_buffer);
                    var function_name = req.params.function_name;
                    var body_as_buffer = Uint8Array.from(req.body);
                    console.log("Body as buffer: " + body_as_buffer);
                    //var return_value = vm.RunUint8Array(wasm_state_as_string, function_name, body_as_buffer); 
                    // TODO remove this line when SSVM is ready
                    res.send(req.body); // Delete this line, it is just for testing whilst ssvm is being updated
                    //res.send(new Buffer(return_value));
                });
            } else {
                console.log("Error processing bytes for function: " + function_name + " for Wasm executable with wasm_id: " + req.params.wasm_id);
                res.end();
            }
        } else {
            json_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(json_response));
        }
    });
});
//
//
/* Running Wasm Functions */

// 
//
//* Dynamic configuration for individual Wasm executables */

// Set any state information i.e. config that relates to this Wasm executable (must be valid JSON string)
app.put('/api/state/:wasm_id', bodyParser.json(), (req, res) => {
    json_response = {};
    console.log("Request to update state into the database ...");
    console.log(req.body);
    console.log(JSON.stringify(req.body));
    executableExists(req.params.wasm_id).then((result, error) => {
        console.log("Result:" + result + ".");
        if (result == 1) {
            if (req.is('application/json') == 'application/json') {
                var sqlSelect = "SELECT wasm_binary from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                var sqlInsert = "UPDATE wasm_executables SET wasm_state = '" + JSON.stringify(req.body) + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
                console.log(sqlInsert);
                performSqlQuery(sqlInsert).then((resultInsert) => {
                    console.log("1 state object has been inserted at wasm_id: " + req.params.wasm_id);
                    json_response["wasm_id"] = req.params.wasm_id;
                    console.log(JSON.stringify(json_response));
                    res.send(JSON.stringify(json_response));
                });
            }
        } else {
            json_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(json_response));
        }
    });
});