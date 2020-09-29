const axios = require('axios');
/* Application dependencies & config - START */
// Config
require('dotenv').config();

//Mime 
var mime = require('mime-types')

// Node Cache
const NodeCache = require("node-cache");
const myCache = new NodeCache();

// Random string
var randomstring = require("randomstring");

// UUID
const {
    v4: uuidv4
} = require('uuid');

//File system
const fs = require('fs');


// Server name for keys
const server_name = process.env.server_name;
// HTTPS
const https = require('https');
const privateKey = fs.readFileSync('/etc/letsencrypt/live/' + server_name + '/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/' + server_name + '/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/' + server_name + '/fullchain.pem', 'utf8');
const helmet = require("helmet");
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

// Buffer string to array
const converter = require('buffer-string-to-array')

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

// Logging
// 0 equals no logging
// 1 equals logging
console.log("Setting log level ...");
const log_level = process.env.log_level;

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
var ssvm = require('ssvm-storage');

// Checksum
const checksum = require('crypto');

/* Application dependencies & config - END */

/* Application startup - START */
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

/* Application startup - END */

/* Utils - START */
function objectIsEmpty(_json) {
    if (typeof _json == "string") {
        _json = JSON.parse(_json);
    }
    //console.log("Processing JSON: " + JSON.stringify(_json));
    var empty = true;
    return new Promise(function(resolve, reject) {
        for (var key in _json) {
            console.log("Processing key: " + key);
            if (_json.hasOwnProperty(key)) {
                console.log("*");
                empty = false;
                break;
            }
        }
        console.log("It is resolved that the JSON object is not empty, returning to function execution ...");
        resolve(empty);
    });
}

function isValidJSON(text) {
    return new Promise(function(resolve, reject) {
        if (typeof text !== "string") {
            console.log("Not a JSON string");
            resolve(false);
        }
        try {
            JSON.parse(text);
            resolve(true);
        } catch (error) {
            resolve(false);
        }
    });
}

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
            resolve(resultSelect.length);
        });
    });
}

function executeCallbackRequest(_original_id, _request_options) {
    return new Promise(function(resolve, reject) {
        if (log_level == 1) {
            var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + _original_id + "';";
            performSqlQuery(sqlSelect).then((stateResult) => {
                var logging_object = {};
                logging_object["original_wasm_executables_id"] = _original_id;
                logging_object["callback_request_options"] = _request_options;
                var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + _original_id + "', '" + stateResult[0].wasm_state + "', NOW(), '" + JSON.stringify(logging_object) + "');";
                performSqlQuery(sqlInsert).then((resultInsert) => {});
            });
        }
        var options = JSON.parse(_request_options);
        var data = options.body;
        if (typeof data == "object") {
            data = JSON.stringify(data);
        }
        options["headers"]["Content-Length"] = data.length;
        delete options.body;
        const req = https.request(JSON.parse(JSON.stringify(options)), (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    resolve(data);
                } catch (error) {
                    console.error(error.message);
                };
            });
        }).on("error", (err) => {
            console.log("Error: ", err.message);
        });
        req.write(data);
        req.end();

    });
}

function executeMultipartRequest(_original_id, _request_options) {
    return new Promise(function(resolve, reject) {
        if (log_level == 1) {
            var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + _original_id + "';";
            performSqlQuery(sqlSelect).then((stateResult) => {
                var logging_object = {};
                logging_object["original_wasm_executables_id"] = _original_id;
                logging_object["callback_request_options"] = _request_options;
                var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + _original_id + "', '" + stateResult[0].wasm_state + "', NOW(), '" + JSON.stringify(logging_object) + "');";
                performSqlQuery(sqlInsert).then((resultInsert) => {});
            });
        }
        var options = JSON.parse(_request_options);
        const data = JSON.stringify(options["body"]);
        delete options.body;
        options["headers"]["Content-Length"] = data.length;
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                try {
                    if (typeof body == "object") {
                        resolve(JSON.stringify(body));
                    } else if (typeof body == "string") {
                        resolve(body);
                    }
                } catch (error) {
                    console.error(error.message);
                };
            });
        }).on("error", (err) => {
            console.log("Error: ", err.message);
        });

        req.write(data);
        req.end();
    });
}


function axiosFetch(_value) {
    return new Promise(function(resolve, reject) {
        axios.get(_value, {
                responseType: 'arraybuffer'
            }).then(function(response) {
                //const buffer = Buffer.from(response.data, "utf-8");
                // The following will produce 0-255 u8 style
                const buffer = new Uint8Array(response.data);
                //console.log(buffer);
                resolve(buffer);
            })
            .catch(function(error) {
                // handle error
                console.log(error);
            })
            .then(function() {
                // always executed
            });
    });
}

function fetchUsingGet(_value) {
    if (_value.charAt(0) == '"' && _value.charAt(_value.length - 1) == '"') {
        _value = _value.substr(1, _value.length - 2)
    }
    return new Promise(function(resolve, reject) {
        https.get(_value, (res) => {
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                try {
                    if (typeof body == "object") {
                        resolve(JSON.stringify(data));
                    } else if (typeof body == "string") {
                        var contentType = res.headers['content-type'];
                        if (contentType.startsWith("image")) {
                            axiosFetch(_value).then((result, error) => {
                                if (!error) {
                                    resolve(result);
                                } else {
                                    console.log(file_read_error);
                                }
                            });
                        } else {
                            resolve(body);
                        }
                    }
                } catch (error) {
                    console.error(error.message);
                };
            });
        }).on("error", (error) => {
            console.error(error.message);
        });
    });
}

function readTheFile(_file) {
    return new Promise(function(resolve, reject) {
        var file_path = _file[1]["path"];
        var mime_content_type = mime.contentType(file_path);
        console.log(mime_content_type);
        fs.readFile(file_path, (err, data) => {
            if (err) {
                console.log("err ocurred", err);
            } else {
                var return_data = {};
                return_data[_file[0]] = data;
                resolve(JSON.stringify(return_data));
            }
        });
    });
}

function parseMultipart(_readyAtZero, _files, _fields, _req) {
    return new Promise(function(resolve, reject) {
        for (var file of Object.entries(_files)) {
            readTheFile(file).then((file_read_result, file_read_error) => {
                if (!file_read_error) {
                    fetched_result_object = JSON.parse(file_read_result);
                    const _string_position = Object.keys(fetched_result_object)[0].lastIndexOf("_");
                    const index_key = Object.keys(fetched_result_object)[0].slice(_string_position + 1, Object.keys(fetched_result_object)[0].length);
                    _readyAtZero.container[index_key] = fetched_result_object[Object.keys(fetched_result_object)[0]]["data"];
                    _readyAtZero.decrease();
                    if (_readyAtZero.isReady()) {
                        resolve();
                    }
                } else {
                    console.log(file_read_error);
                }
            });
        }
        for (var field of Object.entries(_fields)) {
            const _string_position = field[0].lastIndexOf("_");
            const index_key = field[0].slice(_string_position + 1, field[0].length);

            if (field[0].startsWith("fetch")) {
                if (field[1].startsWith("http")) {
                    console.log("Fetching data using GET ...");
                    fetchUsingGet(field[1]).then((fetched_result, error) => {
                        console.log("Fetching data using GET success!");
                        _readyAtZero.container[index_key] = fetched_result;
                        _readyAtZero.decrease();
                        if (_readyAtZero.isReady()) {
                            resolve();
                        }
                    });
                } else {
                    console.log("Fetching data using POST object ...");
                    executeMultipartRequest(_req.params.wasm_id, field[1]).then((fetched_result2, error) => {
                        console.log("Fetching data using POST object success!");
                        fetched_result_object2 = JSON.parse(JSON.stringify(fetched_result2));
                        _readyAtZero.container[index_key] = JSON.stringify(fetched_result_object2);
                        _readyAtZero.decrease();
                        if (_readyAtZero.isReady()) {
                            resolve();
                        }
                    });
                }
            } else if (field[0].startsWith("SSVM_Callback") || field[0].startsWith("ssvm_callback")) {
                if (_readyAtZero.callback_already_set == false) {
                    _readyAtZero.set_callback_object(JSON.parse(field[1]));
                    _readyAtZero.decrease();
                } else if (_readyAtZero.callback_already_set == true) {
                    _readyAtZero.decrease();
                }
                if (_readyAtZero.isReady()) {
                    resolve();
                }

            } else {
                _readyAtZero.container[index_key] = field[1];

                _readyAtZero.decrease();
                if (_readyAtZero.isReady()) {
                    resolve();
                }
            }

        }
    });
}

function executeSSVM(_readyAtZero, _wasm_id, _storage_key, _function_name, _array_of_parameters, _return_type) {
    var _joey_response = {};
    return new Promise(function(resolve, reject) {
        var sqlSelect = "SELECT wasm_binary, wasm_state from wasm_executables WHERE wasm_id = '" + _wasm_id + "';";
        performSqlQuery(sqlSelect).then((result2, error2) => {
            const nodeBuffer2 = new Buffer.from(result2[0].wasm_binary.toString().split(','));
            var uint8array = new Uint8Array(nodeBuffer2.buffer, nodeBuffer2.byteOffset, nodeBuffer2.length);
            //var uint8array = new Uint8Array(result2[0].wasm_binary.toString().split(','));
            var wasm_state = result2[0].wasm_state;
            var wasi = {
                "args": [],
                "env": {
                    "wasm_id": _wasm_id,
                    "storage_key": _storage_key
                },
                "preopens": {
                    "/": "/tmp"
                }
            };
            wasi.args[0] = wasm_state;
            var vm = new ssvm.VM(uint8array, wasi);
            if (_readyAtZero.fetchable_already_set == true) {
                var fetchable_object = _readyAtZero.get_fetchable_object();
                if (fetchable_object.hasOwnProperty("GET")) {
                    console.log("Performing GET request for SSVM_Fetch ........");
                    fetchUsingGet(fetchable_object["GET"]).then((fetched_result, error) => {
                        objectIsEmpty(_readyAtZero.get_callback_object()).then((resultEmptyObject, error) => {
                            if (resultEmptyObject == false) {
                                var callback_object_for_processing = _readyAtZero.get_callback_object();
                                if (typeof callback_object_for_processing == "string") {
                                    callback_object_for_processing = JSON.parse(callback_object_for_processing);
                                }
                                try {
                                    console.log("Executing ssvm function WITH a callback ...");
                                    if (_return_type == "string") {
                                        var return_value = vm.RunString(_function_name, fetched_result);
                                        callback_object_for_processing["body"] = return_value;
                                        console.log("Success!");
                                    } else if (_return_type == "bytes") {
                                        var return_value = vm.RunUint8Array(_function_name, fetched_result);
                                        console.log("Success!");
                                        callback_object_for_processing["body"] = return_value;
                                    }
                                } catch (err) {
                                    _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                                    resolve(JSON.stringify(_joey_response));
                                }
                                executeCallbackRequest(_wasm_id, JSON.stringify(callback_object_for_processing)).then((callbackResult, error) => {
                                    resolve(callbackResult);
                                });
                            } else {
                                try {
                                    console.log("Executing ssvm function WITHOUT a callback...");
                                    if (_return_type == "string") {
                                        var return_value = vm.RunString(_function_name, fetched_result);
                                        console.log("Success!");
                                    } else if (_return_type == "bytes") {
                                        var return_value = vm.RunUint8Array(_function_name, fetched_result);
                                        console.log("Success!");
                                    }
                                } catch (err) {
                                    _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                                    resolve(JSON.stringify(_joey_response));
                                }
                                resolve(return_value);
                            }
                        });
                    });
                } else if (fetchable_object.hasOwnProperty("POST")) {
                    console.log("Performing POST request for SSVM_Fetch ........");
                    executeMultipartRequest(_wasm_id, fetchable_object["POST"]).then((fetched_result2, error) => {
                        objectIsEmpty(_readyAtZero.get_callback_object()).then((resultEmptyObject, error) => {
                            if (resultEmptyObject == false) {
                                var callback_object_for_processing = _readyAtZero.get_callback_object();
                                if (typeof callback_object_for_processing == "string") {
                                    callback_object_for_processing = JSON.parse(callback_object_for_processing);
                                }
                                try {
                                    console.log("Executing ssvm function WITH a callback ...");
                                    if (_return_type == "string") {
                                        var return_value = vm.RunString(_function_name, fetched_result2);
                                        callback_object_for_processing["body"] = return_value;
                                        console.log("Success!");
                                    } else if (_return_type == "bytes") {
                                        var return_value = vm.RunUint8Array(_function_name, fetched_result2);
                                        console.log("Success!");
                                        callback_object_for_processing["body"] = return_value;
                                    }
                                } catch (err) {
                                    _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                                    resolve(JSON.stringify(_joey_response));
                                }

                                executeCallbackRequest(_wasm_id, JSON.stringify(callback_object_for_processing)).then((callbackResult, error) => {
                                    resolve(callbackResult);
                                });
                            } else {
                                try {
                                    console.log("Executing ssvm function WITHOUT a callback...");
                                    if (_return_type == "string") {
                                        var return_value = vm.RunString(_function_name, fetched_result2);
                                        console.log("Success!");
                                    } else if (_return_type == "bytes") {
                                        var return_value = vm.RunUint8Array(_function_name, fetched_result2);
                                        console.log("Success!");
                                    }
                                } catch (err) {
                                    _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                                    resolve(JSON.stringify(_joey_response));
                                }
                                resolve(return_value);
                            }
                        });
                    });
                }
            } else if (_array_of_parameters.length == 0) {
                objectIsEmpty(_readyAtZero.get_callback_object()).then((resultEmptyObject, error) => {
                    if (resultEmptyObject == false) {
                        var callback_object_for_processing = _readyAtZero.get_callback_object();
                        if (typeof callback_object_for_processing == "string") {
                            callback_object_for_processing = JSON.parse(callback_object_for_processing);
                        }
                        try {
                            console.log("Parameters len == 0");
                            console.log("Executing function WITH a callback ...");
                            if (_return_type == "string") {
                                var return_value = vm.RunString(_function_name);
                                callback_object_for_processing["body"] = return_value;
                                console.log("Success!");
                            } else if (_return_type == "bytes") {
                                var return_value = vm.RunUint8Array(_function_name);
                                console.log("Success!");
                                callback_object_for_processing["body"] = return_value;
                            }
                        } catch (err) {
                            _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                            resolve(JSON.stringify(_joey_response));
                        }

                        executeCallbackRequest(_wasm_id, JSON.stringify(callback_object_for_processing)).then((callbackResult, error) => {
                            resolve(callbackResult);
                        });
                    } else {
                        try {
                            console.log("Parameters len == 0");
                            console.log("Executing function WITHOUT a callback...");
                            if (_return_type == "string") {
                                var return_value = vm.RunString(_function_name);
                                console.log("Success!");
                            } else if (_return_type == "bytes") {
                                var return_value = vm.RunUint8Array(_function_name);
                                console.log("Success!");
                            }
                        } catch (err) {
                            _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                            resolve(JSON.stringify(_joey_response));
                        }
                        resolve(return_value);
                    }
                });
            } else if (_array_of_parameters.length == 1 && typeof _array_of_parameters[0] == "object") {
                console.log("There is only one parameter and it is an object, processing now ...");
                objectIsEmpty(_array_of_parameters[0]).then((resultEmptyParameter, error) => {
                    if (resultEmptyParameter == true) {
                        objectIsEmpty(_readyAtZero.get_callback_object()).then((resultEmptyObject, error) => {
                            if (resultEmptyObject == false) {
                                var callback_object_for_processing = _readyAtZero.get_callback_object();
                                if (typeof callback_object_for_processing == "string") {
                                    callback_object_for_processing = JSON.parse(callback_object_for_processing);
                                }
                                try {
                                    console.log("Parameters len == 1 and it is an object");
                                    console.log("Executing function WITH a callback ...");
                                    if (_return_type == "string") {
                                        var return_value = vm.RunString(_function_name);
                                        callback_object_for_processing["body"] = return_value;
                                        console.log("Success!");
                                    } else if (_return_type == "bytes") {
                                        var return_value = vm.RunUint8Array(_function_name);
                                        console.log("Success!");
                                        callback_object_for_processing["body"] = return_value;
                                    }
                                } catch (err) {
                                    _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                                    resolve(JSON.stringify(_joey_response));
                                }

                                executeCallbackRequest(_wasm_id, JSON.stringify(callback_object_for_processing)).then((callbackResult, error) => {
                                    resolve(callbackResult);
                                });
                            } else {
                                try {
                                    console.log("Parameters len == 1 and it is an object");
                                    console.log("Executing function WITHOUT a callback...");
                                    if (_return_type == "string") {
                                        var return_value = vm.RunString(_function_name);
                                        console.log("Success!");
                                    } else if (_return_type == "bytes") {
                                        var return_value = vm.RunUint8Array(_function_name);
                                        console.log("Success!");
                                    }
                                } catch (err) {
                                    _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                                    resolve(JSON.stringify(_joey_response));
                                }
                                resolve(return_value);
                            }
                        });
                    } else {
                        objectIsEmpty(_readyAtZero.get_callback_object()).then((resultEmptyObject, error) => {
                            if (resultEmptyObject == false) {
                                var callback_object_for_processing = _readyAtZero.get_callback_object();
                                if (typeof callback_object_for_processing == "string") {
                                    callback_object_for_processing = JSON.parse(callback_object_for_processing);
                                }
                                try {
                                    console.log("Parameters len == 1 and it is an empty object");
                                    console.log("Executing function WITH a callback ...");
                                    if (_return_type == "string") {
                                        var return_value = vm.RunString(_function_name, ..._array_of_parameters);
                                        callback_object_for_processing["body"] = return_value;
                                        console.log("Success!");
                                    } else if (_return_type == "bytes") {
                                        var return_value = vm.RunUint8Array(_function_name, ..._array_of_parameters);
                                        console.log("Success!");
                                        callback_object_for_processing["body"] = return_value;
                                    }
                                } catch (err) {
                                    _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                                    resolve(JSON.stringify(_joey_response));
                                }

                                executeCallbackRequest(_wasm_id, JSON.stringify(callback_object_for_processing)).then((callbackResult, error) => {
                                    resolve(callbackResult);
                                });
                            } else {
                                try {
                                    console.log("Parameters len == 1 and it is an empty object");
                                    console.log("Executing function WITHOUT a callback...");
                                    if (_return_type == "string") {
                                        var return_value = vm.RunString(_function_name, ..._array_of_parameters);
                                        console.log("Success!");
                                    } else if (_return_type == "bytes") {
                                        var return_value = vm.RunUint8Array(_function_name, ..._array_of_parameters);
                                        console.log("Success!");
                                    }
                                } catch (err) {
                                    _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                                    resolve(JSON.stringify(_joey_response));
                                }
                                resolve(return_value);
                            }
                        });

                    }
                });
                //
            } else if (_array_of_parameters.length == 1) {
                objectIsEmpty(_readyAtZero.get_callback_object()).then((resultEmptyObject, error) => {
                    if (resultEmptyObject == false) {
                        var callback_object_for_processing = _readyAtZero.get_callback_object();
                        if (typeof callback_object_for_processing == "string") {
                            callback_object_for_processing = JSON.parse(callback_object_for_processing);
                        }
                        try {
                            console.log("Parameters len == 1");
                            console.log("Executing function WITH a callback ...");
                            if (_return_type == "string") {
                                var return_value = vm.RunString(_function_name, ..._array_of_parameters);
                                callback_object_for_processing["body"] = return_value;
                                console.log("Success!");
                            } else if (_return_type == "bytes") {
                                var return_value = vm.RunUint8Array(_function_name, ..._array_of_parameters);
                                console.log("Success!");
                                callback_object_for_processing["body"] = return_value;
                            }
                        } catch (err) {
                            _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                            resolve(JSON.stringify(_joey_response));
                        }

                        executeCallbackRequest(_wasm_id, JSON.stringify(callback_object_for_processing)).then((callbackResult, error) => {
                            resolve(callbackResult);
                        });
                    } else {
                        try {
                            console.log("Parameters len == 1");
                            console.log("Executing function WITHOUT a callback...");
                            if (_return_type == "string") {
                                var return_value = vm.RunString(_function_name, ..._array_of_parameters);
                                console.log("Success!");
                            } else if (_return_type == "bytes") {
                                var return_value = vm.RunUint8Array(_function_name, ..._array_of_parameters);
                                console.log("Success!");
                            }
                        } catch (err) {
                            _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                            resolve(JSON.stringify(_joey_response));
                        }
                        resolve(return_value);
                    }
                });
            } else if (_array_of_parameters.length > 1) {
                objectIsEmpty(_readyAtZero.get_callback_object()).then((resultEmptyObject, error) => {
                    if (resultEmptyObject == false) {
                        var callback_object_for_processing = _readyAtZero.get_callback_object();
                        if (typeof callback_object_for_processing == "string") {
                            callback_object_for_processing = JSON.parse(callback_object_for_processing);
                        }
                        try {
                            console.log("Parameters len > 1");
                            console.log("Executing function WITH a callback ...");
                            if (_return_type == "string") {
                                var return_value = vm.RunString(_function_name, ..._array_of_parameters);
                                callback_object_for_processing["body"] = return_value;
                                console.log("Success!");
                            } else if (_return_type == "bytes") {
                                var return_value = vm.RunUint8Array(_function_name, ..._array_of_parameters);
                                console.log("Success!");
                                callback_object_for_processing["body"] = return_value;
                            }
                        } catch (err) {
                            _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                            resolve(JSON.stringify(_joey_response));
                        }

                        executeCallbackRequest(_wasm_id, JSON.stringify(callback_object_for_processing)).then((callbackResult, error) => {
                            resolve(callbackResult);
                        });
                    } else {
                        try {
                            console.log("Parameters len > 1");
                            console.log("Executing function WITHOUT a callback...");
                            if (_return_type == "string") {
                                var return_value = vm.RunString(_function_name, ..._array_of_parameters);
                                console.log("Success!");
                            } else if (_return_type == "bytes") {
                                var return_value = vm.RunUint8Array(_function_name, ..._array_of_parameters);
                                console.log("Success!");
                            }
                        } catch (err) {
                            _joey_response["return_value"] = "Error executing this function, please check function name, input parameters, return parameter for correctness";
                            resolve(JSON.stringify(_joey_response));
                        }
                        resolve(return_value);
                    }
                });
            }
        });

    });
}



class ReadyAtZero {
    constructor(_items) {
        this.value = _items;
        //console.log(this.value);
        this.container = {};
        this.callback_object = {};
        this.callback_already_set = false;
        this.fetchable_object = {};
        this.fetchable_already_set = false;
    }
    decrease() {
        this.value = this.value - 1;
        //console.log(this.value);
    }
    increase() {
        this.value = this.value + 1;
        //console.log(this.value);
    }
    isReady() {
        //console.log(this.value);
        if (this.value == 0) {
            return true;
        } else {
            return false;
        }
    }
    set_callback_object(_callback_object) {
        this.callback_object = _callback_object;
        this.callback_already_set = true;
    }
    get_callback_object() {
        return this.callback_object;
    }
    callback_already_set() {
        return this.callback_already_set;
    }
    set_fetchable_object(_fetchable_object) {
        this.fetchable_object = _fetchable_object;
        this.fetchable_already_set = true;
    }
    get_fetchable_object() {
        return this.fetchable_object;
    }

    get_value() {
        return this.value;
    }

    fetchable_already_set() {
        return this.fetchable_already_set;
    }

}
/* Utils - END */

/* Ephemeral storage endpoints - START */

// Takes JSON and caches it in memory 
// Default ephemeral storage lasts for 1 hour (3600 seconds)
// TTL is refreshed back to 1 hour if the data us updated, otherwise is expires and is deleted

// Post data to ephmeral storage location ("Must be valid JSON")
app.post('/api/ephemeral_storage', bodyParser.json(), (req, res) => {
    joey_response = {};
    if (req.is('application/json') == 'application/json') {
        isValidJSON(JSON.stringify(req.body)).then((result, error) => {
            if (result == true) {
                var new_key = uuidv4();
                success = myCache.set(new_key, req.body, 3600);
                joey_response["key"] = new_key;
                res.send(JSON.stringify(joey_response));

            } else {
                joey_response["error"] = "Not valid JSON";
                res.send(JSON.stringify(joey_response));
            }
        });
    } else {
        joey_response["error"] = "Mime type in request headers must be application/json";
        res.send(JSON.stringify(joey_response));
    }
});
// Get content at ephemeral storage location
app.get('/api/ephemeral_storage/:key', (req, res) => {
    var joey_response = {};
    var value = myCache.get(req.params.key);
    if (value == undefined) {
        joey_response["error"] = "Key not found";
        res.send(JSON.stringify(joey_response));
    } else {
        joey_response["value"] = value;
        res.send(JSON.stringify(joey_response));
    }
});

app.get('/api/state/:wasm_id', (req, res) => {
    console.log("Request to update state into the database ...");
    executableExists(req.params.wasm_id).then((result, error) => {
        if (result == 1) {
            var header_usage_key = req.header('SSVM_Usage_Key');
            var sqlCheckKey = "SELECT usage_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
                // Set usage key
                if (typeof header_usage_key === 'undefined') {
                    header_usage_key = "00000000-0000-0000-0000-000000000000";
                }
                // Set usage key
                if (header_usage_key == resultCheckKey[0].usage_key.toString()) {
                    var sqlState = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                    performSqlQuery(sqlState).then((sqlStateRes) => {
                        res.send(sqlStateRes[0].wasm_state.toString());
                    });
                } else {
                    joey_response["error"] = "Wrong usage key ... " + req.params.wasm_id + " can not be accessed.";
                    res.send(JSON.stringify(joey_response));
                }
            });
        } else {
            res.send(req.params.wasm_id + " does not exist");
        }
    });
});
// Update data at ephemeral storage location ("Must be valid JSON")
app.put('/api/ephemeral_storage/:key', bodyParser.json(), (req, res) => {
    joey_response = {};
    if (req.is('application/json') == 'application/json') {
        isValidJSON(JSON.stringify(req.body)).then((result, error) => {
            if (result == true) {
                success = myCache.set(req.params.key, req.body, 3600);
                joey_response["key"] = req.params.key;
                res.send(JSON.stringify(joey_response));
            } else {
                joey_response["error"] = "Not valid JSON";
                res.send(JSON.stringify(joey_response));
            }
        });
    } else {
        joey_response["error"] = "Mime type in request headers must be application/json";
        res.send(JSON.stringify(joey_response));
    }
});
// Delete data at ephemeral storage location
app.delete('/api/ephemeral_storage/:key', (req, res) => {
    joey_response = {};
    value = myCache.del(req.params.key);
    joey_response["key"] = req.params.key;
    res.send(JSON.stringify(joey_response));
});

/* Ephemeral storage endpoints - END */

/* Putting, getting, updating and deleting Wasm executables - START */

app.get('/', (req, res) => {
    joey_response = [{
        "application": "wasm_joey"
    }, {
        "usage_documentation:": "https://github.com/second-state/wasm-joey/blob/master/documentation/usage.md"
    }];
    res.send(JSON.stringify(joey_response));
});

// Set a Wasm executable
app.post('/api/executables', bodyParser.raw(), (req, res) => {
    joey_response = {};
    if (req.is('application/octet-stream') == 'application/octet-stream') {
        var wasm_as_buffer = Uint8Array.from(req.body);
        wasm_sha256 = "0x" + checksum.createHash('sha256').update(wasm_as_buffer.toString()).digest('hex');
        if (wasm_sha256 == "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855") {
            joey_response = {};
            joey_response["error"] = "Wasm executable is blank, please check your HTTP request syntax, the wasm file location and also the contents of the wasm file and try again.";
            res.send(JSON.stringify(joey_response));
        } else {
            // Logic for creating keys
            var usage_key = "00000000-0000-0000-0000-000000000000";
            if (typeof req.header('SSVM_Create_Usage_Key') !== 'undefined') {
                if (req.header('SSVM_Create_Usage_Key') == "true" || req.header('SSVM_Create_Usage_Key') == "True") {
                    usage_key = uuidv4();
                }
            }
            var admin_key = uuidv4();
            // storage_key
            var storage_key = randomstring.generate({
                length: 32,
                charset: 'hex'
            });
            var sqlInsert = "INSERT INTO wasm_executables (wasm_description,wasm_binary, wasm_state, wasm_callback_object, usage_key, admin_key, storage_key) VALUES ('" + req.header('SSVM_Description') + "','" + wasm_as_buffer + "', '{}', '{}', '" + usage_key + "', '" + admin_key + "', '" + storage_key + "');";
            performSqlQuery(sqlInsert).then((resultInsert) => {
                console.log("1 record inserted at wasm_id: " + resultInsert.insertId);
                joey_response["wasm_id"] = resultInsert.insertId;
                joey_response["wasm_sha256"] = wasm_sha256;
                joey_response["SSVM_Usage_Key"] = usage_key;
                joey_response["SSVM_Admin_Key"] = admin_key;
                res.send(JSON.stringify(joey_response));
            });
        }
    }
});

app.put('/api/keys/:wasm_id/usage_key', (req, res) => {
    joey_response = {};
    var header_admin_key = req.header('SSVM_Admin_Key');
    var sqlCheckKey = "SELECT admin_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
    performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
        if (header_admin_key == resultCheckKey[0].admin_key.toString()) {
            var usage_key = uuidv4();
            var sqlInsert = "UPDATE wasm_executables SET usage_key ='" + usage_key + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlInsert).then((resultInsertKey) => {
                joey_response["SSVM_Usage_Key"] = usage_key;
                res.send(joey_response);
            });
        } else {
            joey_response["error"] = "Wrong admin key ... " + req.params.wasm_id + " can not be updated.";
            res.send(JSON.stringify(joey_response));
        }
    });
});

app.delete('/api/keys/:wasm_id/usage_key', (req, res) => {
    joey_response = {};
    var header_admin_key = req.header('SSVM_Admin_Key');
    var sqlCheckKey = "SELECT admin_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
    performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
        if (header_admin_key == resultCheckKey[0].admin_key.toString()) {
            var usage_key = "00000000-0000-0000-0000-000000000000";
            var sqlInsert = "UPDATE wasm_executables SET usage_key ='" + usage_key + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlInsert).then((resultInsertKey) => {
                joey_response["SSVM_Usage_Key"] = usage_key;
                res.send(joey_response);
            });
        } else {
            joey_response["error"] = "Wrong admin key ... " + req.params.wasm_id + " can not be updated.";
            res.send(JSON.stringify(joey_response));
        }
    });
});

// Get a Wasm executable
app.get('/api/executables/:wasm_id', (req, res) => {
    joey_response = {};
    executableExists(req.params.wasm_id).then((result, error) => {
        if (result == 1) {
            var valid_filters = ["wasm_id", "wasm_description", "wasm_as_buffer", "wasm_state", "wasm_sha256", "wasm_callback_object"];
            var request_validity = true;
            if (req.query.filterBy != undefined) {
                try {
                    var filters = JSON.parse(req.query.filterBy);
                } catch {
                    joey_response["error"] = "Please check your filterBy parameters. Not valid string array!";
                    res.send(JSON.stringify(joey_response));
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
                            if (filters.includes("wasm_as_buffer")) {
                                filters = removeElementFromArray(filters, "wasm_as_buffer");
                                var sqlSelect = "SELECT wasm_binary from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                                performSqlQuery(sqlSelect).then((result) => {
                                    joey_response["wasm_as_buffer"] = result[0].wasm_binary;
                                    if (filters.length == 0) {
                                        res.send(JSON.stringify(joey_response));
                                    }
                                });
                            }
                        }
                        // We need to perform separate select query for complex objects (LONGBLOB & LONGTEXT etc.)
                        if (filters.length >= 1) {
                            if (filters.includes("wasm_sha256")) {
                                filters = removeElementFromArray(filters, "wasm_sha256");
                                var sqlSelect = "SELECT wasm_binary from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                                performSqlQuery(sqlSelect).then((result) => {
                                    joey_response["wasm_sha256"] = "0x" + checksum.createHash('sha256').update(result[0].wasm_binary.toString()).digest('hex');
                                    if (filters.length == 0) {
                                        res.send(JSON.stringify(joey_response));
                                    }
                                });
                            }
                        }
                        // We can join the simple objects i.e. char and just perform one select query for these
                        if (filters.length >= 1) {
                            var sqlSelect = "SELECT " + filters.join() + " from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                            performSqlQuery(sqlSelect).then((result) => {
                                if (filters.includes("wasm_id")) {
                                    joey_response["wasm_id"] = result[0].wasm_id;
                                }
                                if (filters.includes("wasm_description")) {
                                    joey_response["wasm_description"] = result[0].wasm_description;
                                }
                                if (filters.includes("wasm_state")) {
                                    joey_response["wasm_state"] = result[0].wasm_state;
                                }
                                if (filters.includes("wasm_callback_object")) {
                                    joey_response["wasm_callback_object"] = result[0].wasm_callback_object;
                                }
                                filters = [];
                                if (filters.length == 0) {
                                    res.send(JSON.stringify(joey_response));
                                }
                            });
                        }
                    }
                }
            } else {
                var sqlSelect = "SELECT * from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                performSqlQuery(sqlSelect).then((result) => {
                    joey_response["wasm_id"] = result[0].wasm_id;
                    joey_response["wasm_sha256"] = "0x" + checksum.createHash('sha256').update(result[0].wasm_binary.toString()).digest('hex');
                    joey_response["wasm_description"] = result[0].wasm_description;
                    joey_response["wasm_as_buffer"] = result[0].wasm_binary;
                    joey_response["wasm_state"] = result[0].wasm_state;
                    joey_response["wasm_callback_object"] = result[0].wasm_callback_object;
                    res.send(JSON.stringify(joey_response));
                });
            }
        } else {
            joey_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(joey_response));
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
    joey_response = {};
    executableExists(req.params.wasm_id).then((result, error) => {
        if (result == 1) {
            // Check the admin key
            var header_admin_key = req.header('SSVM_Admin_Key');
            var sqlCheckKey = "SELECT admin_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
                if (header_admin_key == resultCheckKey[0].admin_key.toString()) {
                    if (req.is('application/octet-stream') == 'application/octet-stream') {
                        var wasm_as_buffer = Uint8Array.from(req.body);
                        wasm_sha256 = "0x" + checksum.createHash('sha256').update(wasm_as_buffer.toString()).digest('hex');
                        if (wasm_sha256 == "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855") {
                            joey_response = {};
                            joey_response["error"] = "Wasm executable is blank, please check your HTTP request syntax, the wasm file location and also the contents of the wasm file and try again.";
                            res.send(JSON.stringify(joey_response));
                        } else {
                            var sqlUpdate = "UPDATE wasm_executables SET wasm_binary = '" + wasm_as_buffer + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
                            performSqlQuery(sqlUpdate).then((result) => {
                                joey_response["wasm_id"] = req.params.wasm_id;
                                joey_response["wasm_sha256"] = wasm_sha256;
                                res.send(JSON.stringify(joey_response));
                            });
                        }
                    }
                } else {
                    joey_response["error"] = "Wrong admin key ... " + req.params.wasm_id + " can not be updated.";
                    res.send(JSON.stringify(joey_response));
                }

            });
        } else {
            joey_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(joey_response));
        }
    });
});

app.delete('/api/executables/:wasm_id', (req, res) => {
    joey_response = {};
    executableExists(req.params.wasm_id).then((result, error) => {
        if (result == 1) {
            // Check the admin key
            var header_admin_key = req.header('SSVM_Admin_Key');
            var sqlCheckKey = "SELECT admin_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
                if (header_admin_key == resultCheckKey[0].admin_key.toString()) {
                    var sqlDelete = "DELETE from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                    performSqlQuery(sqlDelete).then((result) => {
                        joey_response["wasm_id"] = req.params.wasm_id
                        res.send(JSON.stringify(joey_response));
                    });
                } else {
                    joey_response["error"] = "Wrong admin key ... " + req.params.wasm_id + " can not be deleted.";
                    res.send(JSON.stringify(joey_response));
                }
            });
        } else {
            joey_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(joey_response));
        }
    });
});

/* Putting, getting, updating and deleting Wasm executables - END */

/* Interacting with Wasm executables - START */

// Run a function by calling with multi part form data (returns a string)
app.post('/api/multipart/run/:wasm_id/:function_name', (req, res, next) => {
    var storage_key = "";
    var joey_response = {};
    var array_of_parameters = [];
    // Perform logging
    if (log_level == 1) {
        var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
        performSqlQuery(sqlSelect).then((stateResult) => {
            var logging_object = {};
            logging_object["original_wasm_executables_id"] = req.params.wasm_id;
            logging_object["data_payload"] = req.body;
            var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + req.params.wasm_id + "', '" + stateResult[0].wasm_state + "', NOW(), '" + JSON.stringify(logging_object) + "');";
            performSqlQuery(sqlInsert).then((resultInsert) => {});
        });
    }
    executableExists(req.params.wasm_id).then((result, error) => {
        if (result == 1) {
            var header_usage_key = req.header('SSVM_Usage_Key');
            var sqlCheckKey = "SELECT usage_key, storage_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
                // Set usage key
                if (typeof header_usage_key === 'undefined') {
                    header_usage_key = "00000000-0000-0000-0000-000000000000";
                }
                // Set usage key
                if (header_usage_key == resultCheckKey[0].usage_key.toString()) {
                    storage_key = resultCheckKey[0].storage_key.toString();
                    const form = formidable({
                        multiples: true
                    });

                    form.parse(req, (err, fields, files) => {
                        if (err) {
                            next(err);
                            joey_response["return_value"] = "Error reading multipart fields and/or files";
                            res.send(JSON.stringify(joey_response));
                            return;
                        }
                        // The formidable file and fields iteration is performed separately by formidable middleware, this is a mechanism to let us know when the iterator has completed the task (avoid race conditions)
                        var readyAtZero = new ReadyAtZero(Object.keys(files).length + Object.keys(fields).length);
                        parseMultipart(readyAtZero, files, fields, req).then((m_result, m_error) => {
                            if (!m_error) {
                                var in_progress = false;
                                while (true && in_progress == false) {
                                    if (readyAtZero.isReady() == true) {
                                        in_progress = true;
                                        var ordered_overarching_container = {};
                                        Object.keys(readyAtZero.container).sort().forEach(function(key) {
                                            ordered_overarching_container[key] = readyAtZero.container[key];
                                        });
                                        for (let [key, value] of Object.entries(ordered_overarching_container)) {
                                            array_of_parameters.push(value);
                                        }
                                        // Callback
                                        if (readyAtZero.callback_already_set == false) {
                                            // No callback yet so we have to check the DB
                                            var sqlSelectCallback = "SELECT wasm_callback_object from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                                            performSqlQuery(sqlSelectCallback).then((resultCallback, error) => {
                                                readyAtZero.set_callback_object(resultCallback[0].wasm_callback_object);
                                                //console.log("We are about to execute ssvm now ...");
                                                executeSSVM(readyAtZero, req.params.wasm_id, storage_key, req.params.function_name, array_of_parameters, "string").then((esfm_result, error) => {
                                                    if (typeof esfm_result == "object") {
                                                        console.log("ssvm execution complete!");
                                                        res.send(JSON.stringify(esfm_result));
                                                        res.end();
                                                    } else if (typeof esfm_result == "string") {
                                                        console.log("ssvm execution complete!");
                                                        res.send(esfm_result);
                                                        res.end();
                                                    }
                                                });
                                            });
                                        } else if (readyAtZero.callback_already_set == true) {
                                            //console.log("We are about to execute ssvm now ...");
                                            executeSSVM(readyAtZero, req.params.wasm_id, storage_key, req.params.function_name, array_of_parameters, "string").then((esfm2_result, error) => {
                                                if (typeof esfm2_result == "object") {
                                                    console.log("ssvm execution complete!");
                                                    res.send(JSON.stringify(esfm2_result));
                                                    res.end();
                                                } else if (typeof esfm2_result == "string") {
                                                    console.log("ssvm execution complete!");
                                                    res.send(esfm2_result);
                                                    res.end();
                                                }

                                            });
                                        }
                                    }
                                }

                            } else {
                                console.log(m_error);
                            }
                        });
                    });

                } else {
                    joey_response["error"] = "Wrong usage key ... " + req.params.wasm_id + " can not be accessed.";
                    res.send(JSON.stringify(joey_response));
                }
            });
        } else {
            res.send(req.params.wasm_id + " does not exist");
        }

    });
});


// Run a function by calling with multi part form data (returns a string)
app.post('/api/multipart/run/:wasm_id/:function_name/bytes', (req, res, next) => {
    var storage_key = "";
    var joey_response = {};
    var array_of_parameters = [];
    // Perform logging
    if (log_level == 1) {
        var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
        performSqlQuery(sqlSelect).then((stateResult) => {
            var logging_object = {};
            logging_object["original_wasm_executables_id"] = req.params.wasm_id;
            logging_object["data_payload"] = req.body;
            var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + req.params.wasm_id + "', '" + stateResult[0].wasm_state + "', NOW(), '" + JSON.stringify(logging_object) + "');";
            performSqlQuery(sqlInsert).then((resultInsert) => {});
        });
    }
    executableExists(req.params.wasm_id).then((result, error) => {
        if (result == 1) {
            var header_usage_key = req.header('SSVM_Usage_Key');
            var sqlCheckKey = "SELECT usage_key, storage_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
                // Set usage key
                if (typeof header_usage_key === 'undefined') {
                    header_usage_key = "00000000-0000-0000-0000-000000000000";
                }
                // Set usage key
                if (header_usage_key == resultCheckKey[0].usage_key.toString()) {
                    storage_key = resultCheckKey[0].storage_key.toString();
                    const form = formidable({
                        multiples: true
                    });

                    form.parse(req, (err, fields, files) => {
                        if (err) {
                            next(err);
                            joey_response["return_value"] = "Error reading multipart fields and/or files";
                            res.send(JSON.stringify(joey_response));
                            return;
                        }
                        // The formidable file and fields iteration is performed separately by formidable middleware, this is a mechanism to let us know when the iterator has completed the task (avoid race conditions)
                        var readyAtZero = new ReadyAtZero(Object.keys(files).length + Object.keys(fields).length);
                        parseMultipart(readyAtZero, files, fields, req).then((m_result, m_error) => {
                            if (!m_error) {
                                var in_progress = false;
                                while (true && in_progress == false) {
                                    if (readyAtZero.isReady() == true) {
                                        in_progress = true;
                                        var ordered_overarching_container = {};
                                        Object.keys(readyAtZero.container).sort().forEach(function(key) {
                                            ordered_overarching_container[key] = readyAtZero.container[key];
                                        });
                                        for (let [key, value] of Object.entries(ordered_overarching_container)) {
                                            array_of_parameters.push(value);
                                        }

                                        // Callback
                                        if (readyAtZero.callback_already_set == false) {
                                            var sqlSelectCallback = "SELECT wasm_callback_object from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                                            performSqlQuery(sqlSelectCallback).then((resultCallback, error) => {
                                                readyAtZero.set_callback_object(resultCallback[0].wasm_callback_object);
                                                executeSSVM(readyAtZero, req.params.wasm_id, storage_key, req.params.function_name, array_of_parameters, "bytes").then((esfm_result, error) => {
                                                    console.log("ssvm execution complete!");
                                                    res.set('Content-Type', 'application/octet-stream');
                                                    res.send(Buffer.from(esfm_result));
                                                });
                                            });
                                        } else if (readyAtZero.callback_already_set == true) {
                                            executeSSVM(readyAtZero, req.params.wasm_id, storage_key, req.params.function_name, array_of_parameters, "bytes").then((esfm2_result, error) => {
                                                console.log("ssvm execution complete!");
                                                res.set('Content-Type', 'application/octet-stream');
                                                res.send(Buffer.from(esfm2_result));
                                            });
                                        }
                                    }
                                }

                            } else {
                                console.log(m_error);
                            }
                        });
                    });

                } else {
                    joey_response["error"] = "Wrong usage key ... " + req.params.wasm_id + " can not be accessed.";
                    res.send(JSON.stringify(joey_response));
                }
            });
        } else {
            res.send(req.params.wasm_id + " does not exist");
        }

    });
});
// Run a function belonging to a Wasm executable -> returns a JSON string
app.post('/api/run/:wasm_id/:function_name', (req, res) => {
    var bytes_input = false;
    var array_of_parameters = [];
    var storage_key = "";
    var function_parameters = "";
    if (typeof req.body != "number" && typeof req.body != "boolean" && typeof req.body != "undefined") {
        console.log("/api/run/:wasm_id/:function_name ...");
        var readyAtZero = new ReadyAtZero(1);
        var content_type = req.headers['content-type'];
        // Perform logging
        if (log_level == 1) {
            var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlSelect).then((stateResult) => {
                console.log("Creating log object");
                var logging_object = {};
                logging_object["original_wasm_executables_id"] = req.params.wasm_id;
                logging_object["data_payload"] = req.body;
                var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + req.params.wasm_id + "', '" + JSON.stringify(stateResult[0].wasm_state) + "', NOW(), '" + JSON.stringify(logging_object) + "');";
                performSqlQuery(sqlInsert).then((resultInsert) => {});
            });
        }
        executableExists(req.params.wasm_id).then((result2, error) => {
            if (result2 == 1) {
                var header_callback_object = req.header('SSVM_Callback');
                if (typeof header_callback_object === 'undefined') {
                    console.log("No callback found in the header keys");
                } else {
                    console.log("Callback found in the header keys");
                    readyAtZero.set_callback_object(JSON.parse(header_callback_object));
                }
                // Implement fetchable object (where server-side fetches the body for the request)
                var header_fetchable_object = req.header('SSVM_Fetch');
                if (typeof header_fetchable_object === 'undefined') {
                    console.log("No fetchable information found in the header keys");
                } else {
                    console.log("Fetchable information found in the header keys");
                    if (header_fetchable_object.startsWith("http")) {
                        console.log("This is a URL");
                        var temp_obj = {};
                        temp_obj["GET"] = header_fetchable_object;
                        readyAtZero.set_fetchable_object(temp_obj);
                    } else {
                        console.log("This is a POST object");
                        var temp_obj = {};
                        temp_obj["POST"] = header_fetchable_object;
                        readyAtZero.set_fetchable_object(temp_obj);
                    }
                }
                var header_usage_key = req.header('SSVM_Usage_Key');
                var sqlCheckKey = "SELECT usage_key, storage_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
                    // Set usage key
                    if (typeof header_usage_key === 'undefined') {
                        header_usage_key = "00000000-0000-0000-0000-000000000000";
                    }
                    // Set usage key
                    if (header_usage_key == resultCheckKey[0].usage_key.toString()) {
                        storage_key = resultCheckKey[0].storage_key.toString();
                        // The input is potentially json object with callback so we have to see if the caller intended it as JSON with a callback object
                        if (content_type == "application/octet-stream") {
                            bytes_input = true;
                            function_parameters = Uint8Array.from(req.body);
                        } else if (content_type == "application/json" || content_type == "text/plain") {
                            if (typeof req.body == "object") {
                                function_parameters = JSON.stringify(req.body);
                            } else if (typeof req.body == "string") {
                                function_parameters = req.body;
                            }
                        }
                        isValidJSON(function_parameters).then((isBodyJson, err) => {
                            if (isBodyJson == true && bytes_input == false) {
                                // Parse the request body 
                                function_parameters = JSON.parse(function_parameters);
                                // Check for callback object
                                if (readyAtZero.callback_already_set == false) {
                                    if (function_parameters.hasOwnProperty('SSVM_Callback')) {
                                        readyAtZero.set_callback_object(function_parameters["SSVM_Callback"]);
                                        delete function_parameters.SSVM_Callback;
                                    }
                                }
                                if (readyAtZero.fetchable_already_set == false) {
                                    if (function_parameters.hasOwnProperty('SSVM_Fetch')) {
                                        if (JSON.stringify(function_parameters["SSVM_Fetch"]).startsWith("http") || JSON.stringify(function_parameters["SSVM_Fetch"]).startsWith("http", 1)) {
                                            console.log("This is a URL");
                                            var temp_obj = {};
                                            temp_obj["GET"] = JSON.stringify(function_parameters["SSVM_Fetch"]);
                                            readyAtZero.set_fetchable_object(temp_obj);
                                        } else {
                                            console.log("This is a POST object");
                                            var temp_obj = {};
                                            temp_obj["POST"] = JSON.stringify(function_parameters["SSVM_Fetch"]);
                                            readyAtZero.set_fetchable_object(temp_obj);
                                        }
                                        delete function_parameters.SSVM_Fetch;
                                    }
                                }
                                function_parameters = JSON.stringify(function_parameters);
                            } else if (isBodyJson == false && bytes_input == false) {
                                function_parameters = req.body;
                            }
                            if (readyAtZero.fetchable_already_set == true) {
                                array_of_parameters.push(readyAtZero.get_fetchable_object());
                                readyAtZero.decrease();
                            } else {
                                array_of_parameters.push(function_parameters);
                                readyAtZero.decrease();
                            }

                            // Callback
                            if (readyAtZero.callback_already_set == false) {
                                // No callback yet so we have to check the DB
                                var sqlSelectCallback = "SELECT wasm_callback_object from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                                performSqlQuery(sqlSelectCallback).then((resultCallback, error) => {
                                    readyAtZero.set_callback_object(resultCallback[0].wasm_callback_object);
                                    executeSSVM(readyAtZero, req.params.wasm_id, storage_key, req.params.function_name, array_of_parameters, "string").then((esfm_result, error) => {
                                        if (typeof esfm_result == "object") {
                                            res.send(JSON.stringify(esfm_result));
                                            res.end();
                                        } else if (typeof esfm_result == "string") {
                                            res.send(esfm_result);
                                            res.end();
                                        }
                                    });
                                });
                            } else if (readyAtZero.callback_already_set == true) {
                                executeSSVM(readyAtZero, req.params.wasm_id, storage_key, req.params.function_name, array_of_parameters, "string").then((esfm2_result, error) => {
                                    if (typeof esfm2_result == "object") {
                                        res.send(JSON.stringify(esfm2_result));
                                        res.end();
                                    } else if (typeof esfm2_result == "string") {
                                        res.send(esfm2_result);
                                        res.end();
                                    }
                                });
                            }

                        });

                    } else {
                        var joey_response = {};
                        joey_response["error"] = "Wrong usage key ... " + req.params.wasm_id + " can not be accessed.";
                        res.send(JSON.stringify(joey_response));
                    }

                });

            } else {
                res.send(req.params.wasm_id + " does not exist");
            }
        });
    } else {
        var joey_response = {};
        joey_response["error"] = "Request body must be plain text, valid JSON string, or byte array";
        res.send(JSON.stringify(joey_response));
    }
});

// Run a function belonging to a Wasm executable -> returns a bytes 
app.post('/api/run/:wasm_id/:function_name/bytes', (req, res) => {
    var bytes_input = false;
    var array_of_parameters = [];
    var storage_key = "";
    var function_parameters = "";
    if (typeof req.body != "number" && typeof req.body != "boolean" && typeof req.body != "undefined") {
        console.log("/api/run/:wasm_id/:function_name ...");
        var readyAtZero = new ReadyAtZero(1);
        var content_type = req.headers['content-type'];

        // Perform logging
        if (log_level == 1) {
            var sqlSelect = "SELECT wasm_state FROM wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlSelect).then((stateResult) => {
                console.log("Creating log object");
                var logging_object = {};
                logging_object["original_wasm_executables_id"] = req.params.wasm_id;
                logging_object["data_payload"] = req.body;
                var sqlInsert = "INSERT INTO wasm_execution_log (wasm_executable_id, wasm_executable_state, execution_timestamp, execution_object) VALUES ('" + req.params.wasm_id + "', '" + JSON.stringify(stateResult[0].wasm_state) + "', NOW(), '" + JSON.stringify(logging_object) + "');";
                performSqlQuery(sqlInsert).then((resultInsert) => {});
            });
        }
        executableExists(req.params.wasm_id).then((result2, error) => {
            if (result2 == 1) {
                var header_callback_object = req.header('SSVM_Callback');
                if (typeof header_callback_object === 'undefined') {
                    console.log("No callback found in the header keys");
                } else {
                    console.log("Callback found in the header keys");
                    readyAtZero.set_callback_object(JSON.parse(header_callback_object));
                }
                // Implement fetchable object (where server-side fetches the body for the request)
                var header_fetchable_object = req.header('SSVM_Fetch');
                if (typeof header_fetchable_object === 'undefined') {
                    console.log("No fetchable information found in the header keys");
                } else {
                    console.log("Fetchable information found in the header keys");
                    if (header_fetchable_object.startsWith("http")) {
                        console.log("This is a URL");
                        var temp_obj = {};
                        temp_obj["GET"] = header_fetchable_object;
                        readyAtZero.set_fetchable_object(temp_obj);
                    } else {
                        console.log("This is a POST object");
                        var temp_obj = {};
                        temp_obj["POST"] = header_fetchable_object;
                        readyAtZero.set_fetchable_object(temp_obj);
                    }
                }
                var header_usage_key = req.header('SSVM_Usage_Key');
                var sqlCheckKey = "SELECT usage_key, storage_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
                    // Set usage key
                    if (typeof header_usage_key === 'undefined') {
                        header_usage_key = "00000000-0000-0000-0000-000000000000";
                    }
                    // Set usage key
                    if (header_usage_key == resultCheckKey[0].usage_key.toString()) {
                        storage_key = resultCheckKey[0].storage_key.toString();
                        // The input is potentially json object with callback so we have to see if the caller intended it as JSON with a callback object
                        if (content_type == "application/octet-stream") {
                            console.log("Request body is an octet stream ...");
                            bytes_input = true;
                            function_parameters = Uint8Array.from(req.body);
                        } else if (content_type == "application/json" || content_type == "text/plain") {
                            if (typeof req.body == "object") {
                                function_parameters = JSON.stringify(req.body);
                            } else if (typeof req.body == "string") {
                                function_parameters = req.body;
                            }
                        }
                        isValidJSON(function_parameters).then((isBodyJson, err) => {
                            if (isBodyJson == true && bytes_input == false) {
                                // Parse the request body 
                                function_parameters = JSON.parse(function_parameters);
                                // Check for callback object
                                if (readyAtZero.callback_already_set == false) {
                                    if (function_parameters.hasOwnProperty('SSVM_Callback')) {
                                        readyAtZero.set_callback_object(function_parameters["SSVM_Callback"]);
                                        delete function_parameters.SSVM_Callback;
                                    }
                                }
                                if (readyAtZero.fetchable_already_set == false) {
                                    if (function_parameters.hasOwnProperty('SSVM_Fetch')) {
                                        if (JSON.stringify(function_parameters["SSVM_Fetch"]).startsWith("http") || JSON.stringify(function_parameters["SSVM_Fetch"]).startsWith("http", 1)) {
                                            console.log("This is a URL");
                                            var temp_obj = {};
                                            temp_obj["GET"] = JSON.stringify(function_parameters["SSVM_Fetch"]);
                                            readyAtZero.set_fetchable_object(temp_obj);
                                        } else {
                                            console.log("This is a POST object");
                                            var temp_obj = {};
                                            temp_obj["POST"] = JSON.stringify(function_parameters["SSVM_Fetch"]);
                                            readyAtZero.set_fetchable_object(temp_obj);
                                        }
                                        delete function_parameters.SSVM_Fetch;
                                    }
                                }
                                function_parameters = JSON.stringify(function_parameters);
                            } else if (isBodyJson == false && bytes_input == false) {
                                function_parameters = req.body;
                            }
                            if (readyAtZero.fetchable_already_set == true) {
                                array_of_parameters.push(readyAtZero.get_fetchable_object());
                                readyAtZero.decrease();
                            } else {
                                array_of_parameters.push(function_parameters);
                                readyAtZero.decrease();
                            }

                            // Callback
                            if (readyAtZero.callback_already_set == false) {
                                // No callback yet so we have to check the DB
                                var sqlSelectCallback = "SELECT wasm_callback_object from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                                performSqlQuery(sqlSelectCallback).then((resultCallback, error) => {
                                    readyAtZero.set_callback_object(resultCallback[0].wasm_callback_object);
                                    executeSSVM(readyAtZero, req.params.wasm_id, storage_key, req.params.function_name, array_of_parameters, "bytes").then((esfm_result, error) => {
                                        res.set('Content-Type', 'application/octet-stream');
                                        res.send(Buffer.from(esfm_result));
                                    });
                                });
                            } else if (readyAtZero.callback_already_set == true) {
                                executeSSVM(readyAtZero, req.params.wasm_id, storage_key, req.params.function_name, array_of_parameters, "bytes").then((esfm2_result, error) => {
                                    res.set('Content-Type', 'application/octet-stream');
                                    res.send(Buffer.from(esfm2_result));
                                });
                            }

                        });

                    } else {
                        var joey_response = {};
                        joey_response["error"] = "Wrong usage key ... " + req.params.wasm_id + " can not be accessed.";
                        res.send(JSON.stringify(joey_response));
                    }

                });

            } else {
                res.send(req.params.wasm_id + " does not exist");
            }
        });
    } else {
        var joey_response = {};
        joey_response["error"] = "Request body must be plain text, valid JSON string, or byte array";
        res.send(JSON.stringify(joey_response));
    }
});


// State is set to blank when a new Wasm executable is put in the system. The following function allows you to update the state via REST
app.put('/api/state/:wasm_id', bodyParser.text(), (req, res) => {
    joey_response = {};
    console.log("Request to update state into the database ...");
    executableExists(req.params.wasm_id).then((result, error) => {
        if (result == 1) {
            var header_admin_key = req.header('SSVM_Admin_Key');
            var sqlCheckKey = "SELECT admin_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
            performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
                if (header_admin_key == resultCheckKey[0].admin_key.toString()) {
                    if (req.is('text/plain') == 'text/plain') {
                        var sqlInsert = "UPDATE wasm_executables SET wasm_state = '" + req.body + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
                        performSqlQuery(sqlInsert).then((resultInsert) => {
                            res.send(req.params.wasm_id);
                        });
                    } else {
                        console.log("Wrong content type");
                        joey_response["error"] = "Wrong content type. Please use Content-Type of text/plain only";
                        res.send(JSON.stringify(joey_response));
                    }
                } else {
                    joey_response["error"] = "Wrong admin key ... " + req.params.wasm_id + " can not be accessed.";
                    res.send(JSON.stringify(joey_response));
                }
            });
        } else {
            res.send(req.params.wasm_id + " does not exist");
        }
    });
});

/* Interacting with state - END */

/* Interacting with callbacks - START */

// The callback object of a Wasm executable is set to blank in the DB at the outset. The following function allows you to update the callback object via REST

app.put('/api/callback/:wasm_id', bodyParser.json(), (req, res) => {
    joey_response = {};
    if (JSON.stringify(req.body).includes("rpc.ssvm.secondstate.io")) {
        joey_response["error"] = "Not allowed to store a callback to the rpc.ssvm.secondstate.io hostname in the database. Please utilise the SSVM_Callback feature in the request header if you want to execute a callback to this hostname";
        res.send(JSON.stringify(joey_response));
    } else {
        var content_type = req.headers['content-type'];
        if (content_type == "application/json") {
            console.log("Request to update callback object in the database ...");
            isValidJSON(JSON.stringify(req.body)).then((result, error) => {
                if (result == true) {
                    executableExists(req.params.wasm_id).then((result2, error) => {
                        if (result2 == 1) {
                            var header_admin_key = req.header('SSVM_Admin_Key');
                            var sqlCheckKey = "SELECT admin_key from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "';";
                            performSqlQuery(sqlCheckKey).then((resultCheckKey) => {
                                if (header_admin_key == resultCheckKey[0].admin_key.toString()) {
                                    var sqlInsert = "UPDATE wasm_executables SET wasm_callback_object = '" + JSON.stringify(req.body) + "' WHERE wasm_id = '" + req.params.wasm_id + "';";
                                    performSqlQuery(sqlInsert).then((resultInsert) => {
                                        res.send(req.params.wasm_id);
                                    });
                                } else {
                                    joey_response["error"] = "Wrong Admin key ... " + req.params.wasm_id + " can not be accessed.";
                                    res.send(JSON.stringify(joey_response));
                                }
                            });
                        } else {
                            joey_response["error"] = req.params.wasm_id + " does not exist";
                            res.send(JSON.stringify(joey_response));
                        }

                    });

                } else {
                    joey_response["error"] = "Not valid JSON";
                    res.send(JSON.stringify(joey_response));
                }
            });
        } else {
            joey_response["error"] = "Must use Content-Type of application/json in the header, please check your request and try again";
            res.send(JSON.stringify(joey_response));

        }
    }
});

/* Interacting with callbacks - END */

/* Interacting with logs - START */

// Get a set of records in relation to execution of callbacks for a particular wasm_id
app.get('/api/log/:wasm_id', (req, res) => {
    joey_response = {};
    executionLogExists(req.params.wasm_id).then((result, error) => {
        if (result >= 1) {
            var valid_filters = ["log_id", "wasm_executable_id", "wasm_executable_state", "execution_timestamp", "execution_object"];
            var request_validity = true;
            if (req.query.filterBy != undefined) {
                try {
                    var filters = JSON.parse(req.query.filterBy);
                } catch {
                    joey_response["error"] = "Please check your filterBy parameters. Not valid string array!";
                    res.send(JSON.stringify(joey_response));
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
                                performSqlQuery(sqlSelect).then((result2) => {
                                    joey_response["wasm_executable_state"] = result2[0].wasm_executable_state;
                                    if (filters.length == 0) {
                                        res.send(JSON.stringify(joey_response));
                                    }
                                });
                            }
                        }
                        // We need to perform separate select query for complex objects (LONGBLOB & LONGTEXT etc.)
                        if (filters.length >= 1) {
                            if (filters.includes("execution_object")) {
                                filters = removeElementFromArray(filters, "execution_object");
                                var sqlSelect = "SELECT execution_object from wasm_execution_log WHERE wasm_executable_id = '" + req.params.wasm_id + "';";
                                performSqlQuery(sqlSelect).then((result3) => {
                                    joey_response["execution_object"] = result3[0].execution_object;
                                    if (filters.length == 0) {
                                        res.send(JSON.stringify(joey_response));
                                    }
                                });
                            }
                        }
                        if (filters.length >= 1) {
                            var sqlSelect = "SELECT " + filters.join() + " from wasm_execution_log WHERE wasm_executable_id = '" + req.params.wasm_id + "';";
                            performSqlQuery(sqlSelect).then((result4) => {
                                if (filters.includes("log_id")) {
                                    joey_response["log_id"] = result4[0].log_id;
                                }
                                if (filters.includes("wasm_executable_id")) {
                                    joey_response["wasm_executable_id"] = result4[0].wasm_executable_id;
                                }
                                if (filters.includes("execution_timestamp")) {
                                    joey_response["execution_timestamp"] = result4[0].execution_timestamp;
                                }
                                filters = [];
                                if (filters.length == 0) {
                                    res.send(JSON.stringify(joey_response));
                                }
                            });
                        }
                    }
                }
            } else {
                console.log("No filters");
                var sqlSelect = "SELECT * from wasm_execution_log WHERE wasm_executable_id = '" + req.params.wasm_id + "';";
                performSqlQuery(sqlSelect).then((result5) => {
                    joey_response["log_id"] = result5[0].log_id;
                    joey_response["wasm_executable_id"] = result5[0].wasm_executable_id;
                    joey_response["wasm_executable_state"] = result5[0].wasm_executable_state;
                    joey_response["execution_timestamp"] = result5[0].execution_timestamp;
                    joey_response["execution_object"] = result5[0].execution_object;
                    res.send(JSON.stringify(joey_response));
                });
            }
        } else {
            joey_response["error"] = "wasm_id of " + req.params.wasm_id + " does not exist";
            res.send(JSON.stringify(joey_response));
        }

    });
});


/* Interacting with logs - END */