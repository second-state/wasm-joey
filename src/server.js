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
    if (req.params[0].wasm_binary.startsWith("http")) {
        console.log("This binary is a link which we need to fetch");
    } else {
        var sql = "INSERT INTO wasm_binary_files (wasm_description,wasm_binary) VALUES (" + req.params[0].wasm_description + "," + req.params[0].wasm_binary + ")";
        connection.query(sql, function(err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            console.log(result);
        });
    }
})

// Read Wasm executable
raptor.method("read_wasm_executable", function(req) {
    console.log("Reading Wasm executable ... ");
    console.log(req.params[0].wasm_id);
    //INSERT INTO wasm_binary_files (wasm_description,wasm_binary)
    //VALUES ('System generated entry for testing','0x1234567890');
})

// Execute Wasm executable
raptor.method("execute_wasm_executable", function(req) {
    console.log("Executing Wasm executable ... ");
})

// Update Wasm executable
raptor.method("update_wasm_executable", function(req) {
    console.log("Updating Wasm executable ... ");
})

// Remove Wasm executable
raptor.method("remove_wasm_executable", function(req) {
    console.log("Removing Wasm executable ... ");
})

// Serve
console.log("Starting server, please wait ... ");
raptor.attach(server);
server.listen(8080);

// END