// Start
console.log("Starting service, please wait ... ");
console.log("\n");
// Application config
console.log("Reading configuration, please wait ... ");
require('dotenv').config()
console.log("Database host: " + process.env.db_host);
console.log("Database port: " + process.env.db_port);
console.log("Database name: " + process.env.db_name);
console.log("Database user: " + process.env.db_user);
console.log("\n");

// MySQL
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

// Request mechanism
var urllib = require('urllib');

raptor.use(function(req, next) {
    console.log("Joey has just received an incoming request!");
    return next();
})

// Methods of the RPC server
raptor.method("ping", function(req) {
    console.log("Processing request for \"ping\" function ... ");
    return "pong";
})

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
                    // Data is Buffer instance
                    const bin = data.toString('binary');
                    const hex = bin.toString('hex');
                    //var s_test = "\u0000asm\u0001\u0000\u0000\u0000\u0001\u0006\u0001`\u0001\u0001\u0003\u0002\u0001\u0000\u0004\u0005\u0001p\u0001\u0001\u0001\u0005\u0003\u0001\u0000\u0010\u0006\u0019\u0003\u0001A���\u0000\u000b\u0000A���\u0000\u000b\u0000A���\u0000\u000b\u0007.\u0004\u0006memory\u0002\u0000\u0006triple\u0000\u0000\n";
                    var sql = "INSERT INTO wasm_binary_files (wasm_description,wasm_binary) VALUES ('"+req.params[0].wasm_description+"','"+hex+"');";
                    console.log("SQL");
                    console.log(sql);
                    connection.query(sql, function(err, result) {
                        if (err) {
                            throw err;
                        }
                        console.log("1 record inserted");
                        console.log(result.insertId);
                    });
                });
            }
})

        // #TODO decide on the response object's design and then create and return it

        // Read Wasm executable
        raptor.method("read_wasm_executable", function(req) {
            console.log("Reading Wasm executable ... ");
            console.log(req.params[0].wasm_id);
            var sql = "SELECT wasm_binary from wasm_binary_files WHERE wasm_id = '" + req.params[0].wasm_id + "'";
            connection.query(sql, function(err, result) {
                if (err) throw err;
                console.log("1 record retrieved");
                console.log(result);
            });
            // #TODO decide on the response object's design and then create and return it
        })

        // Execute Wasm executable
        raptor.method("execute_wasm_executable", function(req) {
            console.log("Executing Wasm executable ... ");
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

        // Serve
        console.log("Starting server, please wait ... "); raptor.attach(server); server.listen(8080);

        // END