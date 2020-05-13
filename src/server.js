// System
// Express
const express = require('express');
const app = express();
// Config
require('dotenv').config();
// Data ser/des
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
//Port
const port = process.env.PORT || 3000;
// Database
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
console.log("\n");

/* Startup */
// Serve
app.listen(port, process.env.host, () => {
    console.log(`Welcome to wasm-joey` + '\nHost:' + process.env.host + '\nPort: ' + port);
    console.log("Reading database configuration, please wait ... ");
    console.log("Database host: " + process.env.db_host);
    console.log("Database port: " + process.env.db_port);
    console.log("Database name: " + process.env.db_name);
    console.log("Database user: " + process.env.db_user);
    console.log("\n");
});
/* End Startup*/

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
app.post('/api/executables', (req, res) => {
    console.log("Request to set a new wasm hex into the database ...");
    var sqlInsert = "INSERT INTO wasm_executables (wasm_description,wasm_hex) VALUES ('" + req.body["wasm_description"] + "','" + req.body["wasm_hex"] + "');";
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
    var sqlSelect = "SELECT * from wasm_executables WHERE wasm_id = '" + req.params.wasm_id + "'";
    console.log(sqlSelect);
    connection.query(sqlSelect, function(err, resultSelect) {
        if (err) {
            res.status(400).send("Perhaps a bad request, or database is not running");
        }
        console.log(resultSelect);
        const json_response = {
            "wasm_id": resultSelect.wasm_id,
            "wasm_description": resultSelect.wasm_description,
            "wasm_as_hex": resultSelect.wasm_hex.toString();
            "wasm_as_buffer": resultSelect.wasm_hex.toJSON();
            res.send(JSON.stringify(json_response));
        }
    });
});

// Get all wasm executables which are currently stored in wasm-joey
app.get('/api/executables', (req, res) => {
    var sqlSelect = "SELECT wasm_id, wasm_description from wasm_executables;";
    console.log(sqlSelect);
    connection.query(sqlSelect, function(err, resultSelect) {
        if (err) {
            res.status(400).send("Perhaps a bad request, or database is not running");
        }
        console.log(resultSelect);
        res.send(JSON.stringify(resultSelect));
    });
});

/*
app.post('/executables', function(req, res) {
    console.log("Loading Wasm executable ... ");
    console.log("Headers");
    console.log(req.headers);
    console.log("Body");
    console.log(req.body);

    //var sql = "INSERT INTO wasm_binary_files (wasm_description,wasm_binary) VALUES ('" + req.params[0].wasm_description + "','" + hex + "');";
    //connection.query(sql, function(err, result) {
    //    if (err) {
    //        throw err;
    //    }
    //    console.log("1 record inserted");
    //});
    res.json(req.body);
});
*/



/*


// Raptor library
const Raptor = require("raptor-rpc");
const raptor = new Raptor();

// HTTP Server
console.log("Cofiguring server, please wait ... ");
const http = require("http");
server = http.createServer(function(req, res) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }
});
console.log("\n");

// HTTP request mechanism
var urllib = require('urllib');

raptor.use(function(req, next) {
    console.log("Joey has just received an incoming request!");
    return next();
})

// SSVM
var ssvm = require('ssvm');

// Methods of the RPC server
raptor.method("ping", function(req) {
    console.log("Processing request for \"ping\" function ... ");
    return "pong";
})

// Location of stored wasm executables
const wasm_file_path = "/media/nvme/wasm_executables/"

// Load Wasm executable
raptor.method("load_wasm_executable", function(req) {
    console.log("Loading Wasm executable ... ");
    console.log(req.params[0].wasm_description);
    console.log(req.params[0].wasm_binary);
    if (req.params[0].wasm_binary.startsWith("https://")) {
        console.log("This a URL - we will go ahead and fetch this raw wasm file now ...");
        urllib.request(req.params[0].wasm_binary, function(err, data, res) {
            if (err) {
                throw err; // you need to handle error
            }
            console.log(res.statusCode);
            console.log(res.headers);
            const hex = "0x" + data.toString('hex');
            console.log(hex);
            var sql = "INSERT INTO wasm_binary_files (wasm_description,wasm_binary) VALUES ('" + req.params[0].wasm_description + "','" + hex + "');";
            connection.query(sql, function(err, result) {
                if (err) {
                    throw err;
                }
                console.log("1 record inserted");
                console.log(result.insertId);
            });

        });
    }
    return result.insertId;
})

// #TODO decide on the response object's design and then create and return it

// Read Wasm executable
raptor.method("read_wasm_executable", function(req) {
    console.log("Reading Wasm executable ... ");
    console.log(req.params[0].wasm_id);
        var sqlSelect = "SELECT * from wasm_executables WHERE wasm_id = '" + req.body["wasm_id"] + "'";
        console.log(sqlSelect);
        connection.query(sqlSelect, function(err, resultSelect) {
            if (err) {
                res.status(400).send("Perhaps a bad request, or database is not running");
            }
            console.log(resultSelect.toString());
            console.log(resultSelect);
        });
    // #TODO decide on the response object's design and then create and return it
})

// Execute Wasm executable
raptor.method("execute_wasm_executable", function(req) {
    console.log("Executing Wasm executable ... ");
    console.log(req);
    // #TODO decide on the response object's design and then create and return it
})

// Update Wasm executable
raptor.method("update_wasm_executable", function(req) {
    console.log("Updating Wasm executable ... ");
    var sql = "UPDATE wasm_binary_files SET wasm_binary = '" + req.params[0].wasm_binary + "' WHERE wasm_id = '" + req.params[0].wasm_id + "'";
    connection.query(sql, function(err, result) {
        if (err) throw err;
        console.log("1 record updated");
        console.log(result);
    });
    // #TODO decide on the response object's design and then create and return it
})

// Remove Wasm executable
raptor.method("remove_wasm_executable", function(req) {
    console.log("Removing Wasm executable ... ");
    var sql = "DELETE from wasm_binary_files WHERE wasm_id = '" + req.params[0].wasm_id + "'";
    connection.query(sql, function(err, result) {
        if (err) throw err;
        console.log("1 record deleted");
        console.log(result);
    });
    // #TODO decide on the response object's design and then create and return it
})

// Temporary - execute Wasm executable from file system
// Takes request parameters like this (function_name as a string and arguments as a list)
// {"jsonrpc": "2.0", "method":"execute_via_file", "params":[{"function_name": "add", "arguments": [333, 555]}], "id": 1}
// {"jsonrpc": "2.0", "method":"execute_via_file", "params":[{"function_name": "say", "arguments": ["World"]}], "id": 1}
raptor.method("execute_hello_bg_file", function(req) {
    console.log("Executing wasm ... ");
    // This is temporary linking to wasm on file system. This will instantiate with Buffer (not file path) in the future
    var vm = new ssvm.VM("/media/nvme/wasm_executables/hello_bg.wasm");
    console.log(vm);
    console.log(req.params[0].function_name);
    console.log(req.params[0].arguments);
    console.log("Total arguments provided = " + req.params[0].arguments.length);
    var argument_list = req.params[0].arguments.toString();
    if (req.params[0].arguments.length <= 5) {
        if (typeof req.params[0].arguments[0] == "string") {
            console.log("Calling run string: " + req.params[0].function_name + " with: " + argument_list);
            switch (req.params[0].arguments.length) {
                case 1:
                    ret = vm.RunString(req.params[0].function_name, req.params[0].arguments[0]);
                    break;
                case 2:
                    ret = vm.RunString(req.params[0].function_name, req.params[0].arguments[0], req.params[0].arguments[1]);
                    break;
                case 3:
                    ret = vm.RunString(req.params[0].function_name, req.params[0].arguments[0], req.params[0].arguments[1], req.params[0].arguments[2]);
                    break;
                case 4:
                    ret = vm.RunString(req.params[0].function_name, req.params[0].arguments[0], req.params[0].arguments[1], req.params[0].arguments[2], req.params[0].arguments[3]);
                    break;
                case 5:
                    ret = vm.RunString(req.params[0].function_name, req.params[0].arguments[0], req.params[0].arguments[1], req.params[0].arguments[2], req.params[0].arguments[3], req.params[0].arguments[4]);
                    break;
            }
        } else if (typeof req.params[0].arguments[0] == "number") {
            console.log("Calling run int: " + req.params[0].function_name + " with: " + argument_list);
            switch (req.params[0].arguments.length) {
                case 1:
                    ret = vm.RunInt(req.params[0].function_name, req.params[0].arguments[0]);
                    break;
                case 2:
                    ret = vm.RunInt(req.params[0].function_name, req.params[0].arguments[0], req.params[0].arguments[1]);
                    break;
                case 3:
                    ret = vm.RunInt(req.params[0].function_name, req.params[0].arguments[0], req.params[0].arguments[1], req.params[0].arguments[2]);
                    break;
                case 4:
                    ret = vm.RunInt(req.params[0].function_name, req.params[0].arguments[0], req.params[0].arguments[1], req.params[0].arguments[2], req.params[0].arguments[3]);
                    break;
                case 5:
                    ret = vm.RunInt(req.params[0].function_name, req.params[0].arguments[0], req.params[0].arguments[1], req.params[0].arguments[2], req.params[0].arguments[3], req.params[0].arguments[4]);
                    break;
            }
        }
    } else if (req.params[0].arguments.length > 5){
                ret = vm.RunUint8Array(req.params[0].function_name, Uint8Array.from(req.params[0].arguments));
    }
    var response_object = {};
    var key = "ssvm_response";
    response_object[key] = [];
    var data = ret;
    response_object[key].push(data);
    return response_object;
})

raptor.method("execute_run_string", function(req) {
    console.log("Executing wasm ... ");
    // This is temporary linking to wasm on file system. This will instantiate with Buffer (not file path) in the future
    var vm = new ssvm.VM(wasm_file_path + req.params[0].wasm_executable_id + ".wasm");
    ret = vm.RunString(req.params[0].function_name, JSON.stringify(req.params[0].arguments));
    var response_object = {};
    var key = "ssvm_response";
    response_object[key] = [];
    var data = ret;
    response_object[key].push(data);
    return response_object;
})

// Custom endpoint for video processing prototype
raptor.method("execute_run_uint8array", function(req) {
    console.log("Executing wasm ... ");
    // This is temporary linking to wasm on file system. This will instantiate with Buffer (not file path) in the future
    var vm = new ssvm.VM(wasm_file_path + req.params[0].wasm_executable_id + ".wasm");
    ret = vm.RunUint8Array(req.params[0].function_name, Uint8Array.from(req.params[0].arguments));
    var response_object = {};
    var key = "ssvm_response";
    response_object[key] = [];
    var data = ret;
    response_object[key].push(data);
    return response_object;
})

// Serve
console.log("Starting server, please wait ... ");
raptor.attach(server);
server.listen(8081);

// END
*/