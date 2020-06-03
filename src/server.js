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

// Multipart form data
const formidable = require('formidable');


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

function executionLogExists(wasm_id) {
    return new Promise(function(resolve, reject) {
        connection.query("select log_id from wasm_execution_log where wasm_executable_id='" + wasm_id + "';", function(err, resultSelect) {
            if (err) {
                res.status(400).send("Perhaps a bad request, or database is not running");
            }
            console.log("Result of select: " + resultSelect.length);
            resolve(resultSelect.length);
        });
    });
}

function executeCallback(_original_id, _request_options, _data_payload) {
    return new Promise(function(resolve, reject) {
        console.log("Updating execution log");
        var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + _original_id + "';";
        performSqlQuery(sqlSelect).then((stateResult) => {
            console.log("Creating log object");
            var logging_object = {};
            logging_object["original_wasm_executables_id"] = _original_id;
            logging_object["callback_request_options"] = _request_options;
            logging_object["callback_data_payload"] = _data_payload;
            var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + _original_id + "', '" + stateResult[0].wasm_state + "', NOW(), '" + JSON.stringify(logging_object) + "');";
            console.log("sqlInsert: " + sqlInsert);
            performSqlQuery(sqlInsert).then((resultInsert) => {
                console.log("Logging updated");
            });
        });
        console.log("Performing callback via https ...");
        var https = require('follow-redirects').https;
        var options = _request_options;
        var req = https.request(options, (res) => {
            var responseString = "";
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            res.on("data", (data) => {
                console.log("Creating response string ...");
                responseString += data;
            });

            res.on("end", () => {
                console.log(responseString);
                resolve(responseString);
                // print to console when response ends
            });
        });
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });
        req.write(JSON.stringify(_data_payload));
        req.end();
    });
}

function fetchUsingGet(_url) {
    return new Promise(function(resolve, reject) {
        https.get(_url, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                try {
                    resolve(body);
                } catch (error) {
                    console.error(error.message);
                };
            });

        }).on("error", (error) => {
            console.error(error.message);
        });
    });
}

function readTheFile(_file_path) {
    return new Promise(function(resolve, reject) {
        fs.readFile(_file_path, (err, data) => {
            if (err) {
                console.log("err ocurred", err);
            } else {
                resolve(data);
            }
        });
    });
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
                try {
                    var filters = JSON.parse(req.query.filterBy);
                } catch {
                    json_response["error"] = "Please check your filterBy parameters. Not valid string array!";
                    res.send(JSON.stringify(json_response));
                    res.end();
                }
                console.log(filters);
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
                        // We need to perform separate select query for complex objects (LONGBLOB & LONGTEXT etc.)
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
                        // We need to perform separate select query for complex objects (LONGBLOB & LONGTEXT etc.)
                        if (filters.length >= 1) {
                            if (filters.includes("wasm_state")) {
                                filters = removeElementFromArray(filters, "wasm_state");
                                var sqlSelect = "SELECT wasm_state from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                                console.log(sqlSelect);
                                performSqlQuery(sqlSelect).then((result) => {
                                    json_response["wasm_state"] = result[0].wasm_state;
                                    if (filters.length == 0) {
                                        res.send(JSON.stringify(json_response));
                                    }
                                });
                            }
                        }
                        // We can join the simple objects i.e. char and just perform one select query for these
                        if (filters.length >= 1) {
                            console.log("Select by joining the following filters: " + filters.join());
                            var sqlSelect = "SELECT " + filters.join() + " from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                            console.log("SQL with filters.join()\n" + sqlSelect);
                            performSqlQuery(sqlSelect).then((result) => {
                                if (filters.includes("wasm_id")) {
                                    json_response["wasm_id"] = result[0].wasm_id;
                                }
                                if (filters.includes("wasm_description")) {
                                    json_response["wasm_description"] = result[0].wasm_description;
                                }
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
        //console.log("Result:" + result + ".");
        if (result == 1) {
            if (req.is('application/octet-stream') == 'application/octet-stream') {
                var wasm_as_buffer = Uint8Array.from(req.body);
                var sqlUpdate = "UPDATE wasm_executables SET wasm_binary = '" + wasm_as_buffer + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
                //console.log(sqlUpdate);
                performSqlQuery(sqlUpdate).then((result) => {
                    json_response["wasm_id"] = req.params.wasm_id;
                    //console.log(JSON.stringify(json_response));
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
        //console.log("Result:" + result + ".");
        if (result == 1) {
            var sqlDelete = "DELETE from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            //console.log(sqlDelete);
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
// Run a function by calling with multi part form data
app.post('/api/multipart/run/:wasm_id/:function_name', (req, res, next) => {
    // Perform logging
    var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
    performSqlQuery(sqlSelect).then((stateResult) => {
        console.log("Creating log object");
        var logging_object = {};
        logging_object["original_wasm_executables_id"] = req.params.wasm_id;
        logging_object["data_payload"] = req.body;
        var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + req.params.wasm_id + "', '" + stateResult[0].wasm_state + "', NOW(), '" + JSON.stringify(logging_object) + "');";
        //console.log("sqlInsert: " + sqlInsert);
        performSqlQuery(sqlInsert).then((resultInsert) => {
            console.log("Logging updated");
            var json_response = {};
            executableExists(req.params.wasm_id).then((result, error) => {
                //console.log("Result:" + result + ".");
                if (result == 1) {
                    const form = formidable({
                        multiples: true
                    });
                    var sqlSelect = "SELECT wasm_binary, wasm_state from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                    performSqlQuery(sqlSelect).then((result2, error2) => {
                        console.log(result2[0].wasm_binary.data);
                        var wasm_state_as_string = result2[0].wasm_state;
                        var wasm_as_buffer = Uint8Array.from(result2[0].wasm_binary);
                        var function_name = req.params.function_name;
                        var raw_data = {};
                        form.parse(req, (err, fields, files) => {
                            if (err) {
                                next(err);
                                return;
                            }
                            var new_file_data = {};
                            var new_file_data_inner = {};
                            console.log("Procesing files: " + files);
                            for (var file of Object.entries(files)) {
                                console.log("Procesing single file: " + file);
                                var label = file[0];
                                console.log("File label is: " + label);
                                var fetched_file_data = readTheFile(file[1]["path"]).then((file_read_result, file_read_error) => {
                                    if (!file_read_error) {
                                        new_file_data_inner[label] = file_read_result;
                                        console.log(new_file_data_inner);
                                    } else {
                                        console.log(file_read_error);
                                    }
                                });
                            }
                            new_file_data["data"] = new_file_data_inner;
                            console.log(new_file_data);

                            // We may use a static naming convention as per below, the above code is just fetching all files and all URLs by default (and then converting them to data)
                            // Not 100% sure what the best use case is here as far as caller's requirements goes. Put this question to Slack so we take best approach.
                            /*
                            if (fields.hasOwnProperty("joey_remote_data_url")) {
                                fetchUsingGet(fields["joey_remote_data_url"]).then((fetchedData) => {
                                    console.log("Fetched data" + fetchedData);
                                    //var vm = new ssvm.VM(wasm_as_buffer);
                                    //var return_value = vm.RunString(wasm_state_as_string, function_name, fetchedData);
                                });
                            }
                            */
                            res.json({
                                fields,
                                files,
                                new_file_data
                            });
                        });

                    });

                }
            });
        });
    });
});

//
// Run a function belonging to a Wasm executable -> returns a JSON string
app.post('/api/run/:wasm_id/:function_name', bodyParser.json(), (req, res) => {
    // Perform logging
    var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
    performSqlQuery(sqlSelect).then((stateResult) => {
        console.log("Creating log object");
        var logging_object = {};
        logging_object["original_wasm_executables_id"] = req.params.wasm_id;
        logging_object["data_payload"] = req.body;
        var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + req.params.wasm_id + "', '" + stateResult[0].wasm_state + "', NOW(), '" + JSON.stringify(logging_object) + "');";
        //console.log("sqlInsert: " + sqlInsert);
        performSqlQuery(sqlInsert).then((resultInsert) => {
            console.log("Logging updated");

            var json_response = {};
            executableExists(req.params.wasm_id).then((result, error) => {
                //console.log("Result:" + result + ".");
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
                                "function": {
                                    "name": "new template name"
                                },
                                "callback": {
                                    "method": "GET",
                                    "hostname": "jsonplaceholder.typicode.com",
                                    "path": "/posts/1",
                                    "headers": {
                                        "Content-Type": "application/json"
                                    },
                                    "maxRedirects": 20
                                }
                            }`

                        /*
                        // Another fictitious return value to test the non callback version
                        return_value = `{
                                "function": {
                                    "name": "new template name"
                                }
                            }`
                            */
                        // Allow for the return value to just be a string and not valid JSON (strings are still acceptable for this vm.RunString endpoint)
                        try {
                            // If Joey is able to parse this response AND the response has a callback object, then Joey needs to perform the callback and give the response of the callback to the original caller
                            var return_value_as_object = JSON.parse(return_value);
                            if (return_value_as_object.hasOwnProperty('callback')) {
                                console.log("Processing callback");
                                var callback_object_for_processing = return_value_as_object["callback"];
                                //console.log("*Callback Object: " + JSON.stringify(callback_object_for_processing));
                                delete return_value_as_object.callback;
                                //console.log("*Return value object: " + JSON.stringify(return_value_as_object));
                                //TODO strip out the callback object and pass exactly what is left of this response to the callback function as the --data payload
                                executeCallback(req.params.wasm_id, callback_object_for_processing, return_value_as_object).then((c_result, error) => {
                                    //console.log("*New value" + c_result);
                                    json_response["return_value"] = c_result;
                                    console.log(json_response);
                                    res.send(JSON.stringify(json_response));
                                });
                            } else {
                                // The response is valid JSON but there is no callback so we just need to return the response to the original caller verbatim
                                json_response["return_value"] = return_value
                                res.send(JSON.stringify(json_response));
                            }
                        } catch {
                            // The response was obviously not valid JSON string so we just want to pass this string back to the original caller verbatim
                            json_response["return_value"] = return_value
                            res.send(JSON.stringify(json_response));
                        }
                    });
                } else {
                    console.log("Error processing bytes for function: " + function_name + " for Wasm executable with wasm_id: " + req.params.wasm_id);
                    res.end();
                }
            });
        });
    });
});

// Run a function belonging to a Wasm executable -> returns a Buffer
// This endpoint calls vm.RunUint8Array which returns a Uint8Array,
// Each of these endpoints can only accept one type of data as the body i.e. the middleware can only parse raw OR json OR plain.,
// For this reason, this function will accept a Uint8Array from the caller (as the body). This makes the most sense because (sending receiving Uint8Array).
app.post('/api/run/:wasm_id/:function_name/bytes', bodyParser.raw(), (req, res) => {
    var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
    performSqlQuery(sqlSelect).then((stateResult) => {
        console.log("Creating log object");
        var logging_object = {};
        logging_object["original_wasm_executables_id"] = req.params.wasm_id;
        logging_object["data_payload"] = req.body;
        var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + req.params.wasm_id + "', '" + stateResult[0].wasm_state + "', NOW(), '" + JSON.stringify(logging_object) + "');";
        //console.log("sqlInsert: " + sqlInsert);
        performSqlQuery(sqlInsert).then((resultInsert) => {
            console.log("Logging updated");

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
    });
});
//
//
/* Running Wasm Functions */

// 
//
//* Dynamic configuration for individual Wasm executables */

// Set any state information i.e. config that relates to this Wasm executable only accepts string format (text) the caller and the Rust Wasm must agree on how the text string is parsed and used
app.put('/api/state/:wasm_id', bodyParser.text(), (req, res) => {
    console.log("Request to update state into the database ...");
    //console.log(req.body);
    executableExists(req.params.wasm_id).then((result, error) => {
        //console.log("Result:" + result + ".");
        if (result == 1) {
            if (req.is('text/plain') == 'text/plain') {
                var sqlInsert = "UPDATE wasm_executables SET wasm_state = '" + req.body + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
                //console.log(sqlInsert);
                performSqlQuery(sqlInsert).then((resultInsert) => {
                    //console.log("1 state object has been inserted at wasm_id: " + req.params.wasm_id);
                    res.send(req.params.wasm_id);
                });
            }
        } else {
            res.send(req.params.wasm_id + " does not exist");
        }
    });
});

// Get a set of records in relation to execution of callbacks for a particular wasm_id
app.get('/api/log/:wasm_id', (req, res) => {
    json_response = {};
    executionLogExists(req.params.wasm_id).then((result, error) => {
        //console.log("Result:" + result + ".");
        if (result >= 1) {
            var valid_filters = ["log_id", "wasm_executable_id", "wasm_executable_state", "execution_timestamp", "execution_object"];
            var request_validity = true;
            if (req.query.filterBy != undefined) {
                try {
                    var filters = JSON.parse(req.query.filterBy);
                } catch {
                    json_response["error"] = "Please check your filterBy parameters. Not valid string array!";
                    res.send(JSON.stringify(json_response));
                    res.end();
                }
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
                        // We need to perform separate select query for complex objects (LONGBLOB & LONGTEXT etc.)
                        if (filters.length >= 1) {
                            if (filters.includes("wasm_executable_state")) {
                                filters = removeElementFromArray(filters, "wasm_executable_state");
                                var sqlSelect = "SELECT wasm_executable_state from wasm_execution_log WHERE wasm_executable_id = '" + req.params.wasm_id + "';";
                                //console.log(sqlSelect);
                                performSqlQuery(sqlSelect).then((result) => {
                                    json_response["wasm_executable_state"] = result[0].wasm_executable_state;
                                    if (filters.length == 0) {
                                        res.send(JSON.stringify(json_response));
                                    }
                                });
                            }
                        }
                        // We need to perform separate select query for complex objects (LONGBLOB & LONGTEXT etc.)
                        if (filters.length >= 1) {
                            if (filters.includes("execution_object")) {
                                filters = removeElementFromArray(filters, "execution_object");
                                var sqlSelect = "SELECT execution_object from wasm_execution_log WHERE wasm_executable_id = '" + req.params.wasm_id + "';";
                                //console.log(sqlSelect);
                                performSqlQuery(sqlSelect).then((result) => {
                                    json_response["execution_object"] = result[0].execution_object;
                                    if (filters.length == 0) {
                                        res.send(JSON.stringify(json_response));
                                    }
                                });
                            }
                        }
                        if (filters.length >= 1) {
                            var sqlSelect = "SELECT " + filters.join() + " from wasm_execution_log WHERE wasm_executable_id = '" + req.params.wasm_id + "';";
                            //console.log("SQL with filters.join()\n" + sqlSelect);
                            performSqlQuery(sqlSelect).then((result) => {
                                if (filters.includes("log_id")) {
                                    json_response["log_id"] = result[0].log_id;
                                }
                                if (filters.includes("wasm_executable_id")) {
                                    json_response["wasm_executable_id"] = result[0].wasm_executable_id;
                                }
                                if (filters.includes("execution_timestamp")) {
                                    json_response["execution_timestamp"] = result[0].execution_timestamp;
                                }
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
                var sqlSelect = "SELECT * from wasm_execution_log WHERE wasm_executable_id = '" + req.params.wasm_id + "';";
                //console.log(sqlSelect);
                performSqlQuery(sqlSelect).then((result) => {
                    json_response["log_id"] = result[0].log_id;
                    json_response["wasm_executable_id"] = result[0].wasm_executable_id;
                    json_response["wasm_executable_state"] = result[0].wasm_executable_state;
                    json_response["execution_timestamp"] = result[0].execution_timestamp;
                    json_response["execution_object"] = result[0].execution_object;
                    res.send(JSON.stringify(json_response));
                });
            }
        } else {
            json_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(json_response));
        }

    });
});