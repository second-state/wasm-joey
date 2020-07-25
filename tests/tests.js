// ************************************************************************************************
// Joey production instance
const joey_instance = "rpc.ssvm.secondstate.io";
// Joey development instanance
//const joey_instance = "dev.rpc.ssvm.secondstate.io";

// Set up environment
const https = require('https');
var fs = require('fs');

class WasmObject {
    constructor() {
        this.wasm_id;
        this.wasm_description;
        this.SSVM_Admin_Key;
        this.SSVM_Usage_Key;
        this.wasm_sha256;
        this.ephemeral_storage_key;
    }

    set_wasm_id(_wasm_id) {
        this.wasm_id = _wasm_id;
    }
    get_wasm_id() {
        return this.wasm_id;
    }
    set_wasm_description(_wasm_description) {
        this.wasm_description = _wasm_description;
    }
    get_wasm_description() {
        return this.wasm_description;
    }
    set_SSVM_Admin_Key(_SSVM_Admin_Key) {
        this.SSVM_Admin_Key = _SSVM_Admin_Key;
    }
    get_SSVM_Admin_Key() {
        return this.SSVM_Admin_Key;
    }
    set_SSVM_Usage_Key(_SSVM_Usage_Key) {
        this.SSVM_Usage_Key = _SSVM_Usage_Key;
    }
    get_SSVM_Usage_Key() {
        return this.SSVM_Usage_Key;
    }
    set_wasm_sha256(_wasm_sha256) {
        this.wasm_sha256 = _wasm_sha256;
    }
    get_wasm_sha256() {
        return this.wasm_sha256;
    }
    set_ephemeral_storage_key(_ephemeral_storage_key) {
        this.ephemeral_storage_key = _ephemeral_storage_key;
    }
    get_ephemeral_storage_key() {
        return this.ephemeral_storage_key;
    }

}
var wasm_object = new WasmObject();
var wasm_object_average = new WasmObject();
var wasm_object_c_to_f = new WasmObject();

// ************************************************************************************************
// Helper functions
function printMessage(_message) {
    return new Promise(function(resolve, reject) {
        if (_message.includes("error") || _message.includes("Error")) {
            console.log("\x1b[31m", _message);
            resolve();
        } else {
            console.log("\x1b[32m", _message);
            resolve();
        }
    });
}

// ************************************************************************************************
// Load a new wasm executable
function loadExecutable() {
    console.log("\x1b[32m", "Processing: loadExecutable() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/executables',
                'headers': {
                    'Content-Type': 'application/octet-stream',
                    'SSVM_Description': 'Hello'
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var res_object = JSON.parse(body.toString());
                    wasm_object.set_wasm_id(res_object["wasm_id"]);
                    wasm_object.set_SSVM_Admin_Key(res_object["SSVM_Admin_Key"]);
                    wasm_object.set_SSVM_Usage_Key(res_object["SSVM_Usage_Key"]);
                    wasm_object.set_wasm_sha256(res_object["wasm_sha256"]);
                    console.log("\x1b[32m", "wasm_id:" + wasm_object.get_wasm_id());
                    console.log("\x1b[32m", "SSVM_Admin_Key:" + wasm_object.get_SSVM_Admin_Key());
                    console.log("\x1b[32m", "SSVM_Usage_Key:" + wasm_object.get_SSVM_Usage_Key());
                    console.log("\x1b[32m", "wasm_sha256:" + wasm_object.get_wasm_sha256());
                    resolve();
                });
                res.on("error", function(error) {
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
            });
            var postData = fs.readFileSync('./hello_bg.wasm');
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Load a new wasm executable
function loadExecutableAverage() {
    console.log("\x1b[32m", "Processing: loadExecutableAverage() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/executables',
                'headers': {
                    'Content-Type': 'application/octet-stream',
                    'SSVM_Description': 'Average'
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var res_object = JSON.parse(body.toString());
                    wasm_object_average.set_wasm_id(res_object["wasm_id"]);
                    wasm_object_average.set_SSVM_Admin_Key(res_object["SSVM_Admin_Key"]);
                    wasm_object_average.set_SSVM_Usage_Key(res_object["SSVM_Usage_Key"]);
                    wasm_object_average.set_wasm_sha256(res_object["wasm_sha256"]);
                    console.log("\x1b[32m", "wasm_id:" + wasm_object_average.get_wasm_id());
                    console.log("\x1b[32m", "SSVM_Admin_Key:" + wasm_object_average.get_SSVM_Admin_Key());
                    console.log("\x1b[32m", "SSVM_Usage_Key:" + wasm_object_average.get_SSVM_Usage_Key());
                    console.log("\x1b[32m", "wasm_sha256:" + wasm_object_average.get_wasm_sha256());
                    resolve();
                });
                res.on("error", function(error) {
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
            });
            var postData = fs.readFileSync('./average_bg.wasm');
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Load a new wasm executable
function loadExecutableCF() {
    console.log("\x1b[32m", "Processing: loadExecutableCF() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/executables',
                'headers': {
                    'Content-Type': 'application/octet-stream',
                    'SSVM_Description': 'Celsius to Fahrenheit'
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var res_object = JSON.parse(body.toString());
                    wasm_object_c_to_f.set_wasm_id(res_object["wasm_id"]);
                    wasm_object_c_to_f.set_SSVM_Admin_Key(res_object["SSVM_Admin_Key"]);
                    wasm_object_c_to_f.set_SSVM_Usage_Key(res_object["SSVM_Usage_Key"]);
                    wasm_object_c_to_f.set_wasm_sha256(res_object["wasm_sha256"]);
                    console.log("\x1b[32m", "wasm_id:" + wasm_object_c_to_f.get_wasm_id());
                    console.log("\x1b[32m", "SSVM_Admin_Key:" + wasm_object_c_to_f.get_SSVM_Admin_Key());
                    console.log("\x1b[32m", "SSVM_Usage_Key:" + wasm_object_c_to_f.get_SSVM_Usage_Key());
                    console.log("\x1b[32m", "wasm_sha256:" + wasm_object_c_to_f.get_wasm_sha256());
                    resolve();
                });
                res.on("error", function(error) {
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
            });
            var postData = fs.readFileSync('./c_to_f_bg.wasm');
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Update a new wasm executable
function updateExecutable() {
    console.log("\x1b[32m", "Processing: updateExecutable() ...");
    var id_to_update = wasm_object.get_wasm_id();
    var admin_key = wasm_object.get_SSVM_Admin_Key();
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'PUT',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/update_wasm_binary/' + id_to_update,
                'headers': {
                    'Content-Type': 'application/octet-stream',
                    'SSVM_Admin_Key': admin_key
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var res_object = JSON.parse(body.toString());
                    printMessage(body.toString()).then((printResult) => {});
                    wasm_object.set_wasm_sha256(res_object["wasm_sha256"]);
                    resolve();
                });
                res.on("error", function(error) {
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
            });
            var postData = fs.readFileSync('./hello_bg.wasm');
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Update a new wasm executable
function updateExecutableAdminKey() {
    console.log("\x1b[32m", "Processing: updateExecutableAdminKey() ...");
    var id_to_update = wasm_object.get_wasm_id();
    var admin_key = wasm_object.get_SSVM_Admin_Key() + "WRONG ADMIN KEY";
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'PUT',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/update_wasm_binary/' + id_to_update,
                'headers': {
                    'Content-Type': 'application/octet-stream',
                    'SSVM_Admin_Key': admin_key
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var res_object = JSON.parse(body.toString());
                    if (body.toString().includes("Wrong admin key")) {
                        printMessage("Success: Joey detected that this requires an Admin Key").then((printResult) => {});
                    } else {
                        printMessage("Error: Joey was supposed to fail due to the wrong Admin Key").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
            });
            var postData = fs.readFileSync('./hello_bg.wasm');
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Get a wasm executable
function getExecutable() {
    console.log("Processing: getExecutable() ...");
    var id_to_get = wasm_object.get_wasm_id();
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'GET',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/executables/' + id_to_get,
                'headers': {},
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var res_object = JSON.parse(body.toString());
                    if (wasm_object.get_wasm_id() == res_object["wasm_id"]) {
                        printMessage("Success: " + wasm_object.get_wasm_id()).then((printResult) => {});
                    } else {
                        printMessage("Error, unable to obtain wasm_id in unit test called getExecutable()").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
            });
            req.end();
        } catch {
            reject();
        }
    });
}
// ************************************************************************************************
// Get a wasm executable
function getExecutableFilterByDescription() {
    console.log("Processing: getExecutableFilterByDescription() ...");
    var id_to_get = wasm_object.get_wasm_id();
    var query_string = '?filterBy=["wasm_description"]';
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'GET',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/executables/' + id_to_get + query_string,
                'headers': {},
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var res_object = JSON.parse(body.toString());
                    if (res_object["wasm_description"] == "Hello") {
                        printMessage("Wasm description:: " + res_object["wasm_description"]).then((printResult) => {});
                    } else {
                        printMessage("Error, unable to obtain wasm_description in unit test called getExecutableFilterByDescription()").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
            });
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Get a wasm executable
function getExecutableFilterBySha256() {
    console.log("Processing: getExecutableFilterBySha256() ...");
    var id_to_get = wasm_object.get_wasm_id();
    var query_string = '?filterBy=["wasm_sha256"]';
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'GET',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/executables/' + id_to_get + query_string,
                'headers': {},
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var res_object = JSON.parse(body.toString());
                    if (res_object["wasm_sha256"] == wasm_object.get_wasm_sha256()) {
                        printMessage("Wasm sha256:: " + res_object["wasm_sha256"]).then((printResult) => {});
                    } else {
                        printMessage("Error, unable to obtain wasm_sha256 in unit test called getExecutableFilterBySha256()").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
            });
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Execute a wasm executable's function
function executeExecutablesFunction() {
    var id_to_use = wasm_object.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesFunction() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/run/' + id_to_use + '/say',
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
                    var body = Buffer.concat(chunks);
                    if (body.toString().includes("hello Tim")) {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesFunction() test").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            var postData = "Tim";
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Execute a wasm executable's function
function executeExecutablesFunctionWithHeaderFetch() {
    var id_to_use = wasm_object.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesFunctionWithHeaderFetch() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/run/' + id_to_use + '/say',
                'headers': {
                    'SSVM_Fetch': 'https://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim2.txt',
                    'Content-Type': 'application/json'
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    if (body.toString().includes("hello Tim2")) {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesFunctionWithHeaderFetch() test").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            var postData = JSON.stringify({
                "SSVM_Fetch": "https://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt"
            });
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Execute a wasm executable's function
function executeExecutablesFunctionWithBodyFetch() {
    var id_to_use = wasm_object.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesFunctionWithBodyFetch() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/run/' + id_to_use + '/say',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    if (body.toString().includes("hello Tim")) {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesFunctionWithBodyFetch() test").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            var postData = JSON.stringify({
                "SSVM_Fetch": "https://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt"
            });
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}


// ************************************************************************************************
// Execute a wasm executable's function
function executeExecutablesFunctionWithHeaderCallback() {
    var id_to_use = wasm_object.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesFunctionWithHeaderCallback() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/run/' + id_to_use + '/say',
                'headers': {
                    'SSVM_Callback': '{"hostname": "rpc.ssvm.secondstate.io","path": "/api/run/' + id_to_use + '/say","method": "POST","port": 8081,"headers":{"Content-Type": "text/plain"}}',
                    'Content-Type': 'text/plain'
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    if (body.toString().includes("hello hello Tim")) {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesFunctionWithHeaderCallback() test").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            var postData = "Tim";
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Execute a wasm executable's function
function executeExecutablesFunctionWithBodyCallback() {
    var id_to_use = wasm_object.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesFunctionWithBodyCallback() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/run/' + id_to_use + '/say',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    if (body.toString().includes("hello hello {}")) {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesFunctionWithBodyCallback() test").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            var postData = JSON.stringify({
                "SSVM_Callback": {
                    "hostname": joey_instance,
                    "path": '/api/run/' + id_to_use + '/say',
                    "method": "POST",
                    "port": 8081,
                    "headers": {
                        "Content-Type": "text/plain"
                    }
                }
            });
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Execute a wasm executable's function
function executeExecutablesFunctionWithBodyCallback2() {
    var id_to_use = wasm_object_average.get_wasm_id();
    var id_to_callback = wasm_object_c_to_f.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesFunctionWithBodyCallback2() ...");
    return new Promise(function(resolve, reject) {
        try {
            // This is the HTTPS Request options
            var options = {
                "hostname": joey_instance,
                "path": '/api/run/' + id_to_use + '/calculate_average_temperature',
                "method": "POST",
                'port': 8081,
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                'maxRedirects': 20
            };
            // This is the body of the HTTPS Request (Note the callback object, as well as the data called individual_temperatures co-exist at the top level of the JSON body object)
            var postData = JSON.stringify({
                "SSVM_Callback": {
                    "hostname": joey_instance,
                    "path": "/api/run/" + id_to_callback + "/convert_celsius_to_fahrenheit",
                    "method": "POST",
                    "port": 8081,
                    "headers": {
                        "Content-Type": "text/plain"
                    }
                },
                "individual_temperatures": [25, 25, 25, 25, 25]
            });
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    // Check that 125 Degrees Celsius has been converted to 77 Degrees Fahrenheit
                    if (body.toString().includes("77.0")) {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesFunctionWithBodyCallback2() test").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}


// ************************************************************************************************
// Add data to ephemeral storage
function addDataToEphemeralStorage() {
    console.log("\x1b[32m", "Processing: addDataToEphemeralStorage() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/ephemeral_storage',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];

                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    if (JSON.parse(body.toString()).hasOwnProperty('key')) {
                        wasm_object.set_ephemeral_storage_key(JSON.parse(body.toString())["key"]);
                        printMessage("Success, key is: " + wasm_object.get_ephemeral_storage_key()).then((printResult) => {});
                    } else {
                        printMessage("Error: " + body.toString()).then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            var postData = JSON.stringify({
                "asdf": 25
            });
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Add data to ephemeral storage
function getDataFromEphemeralStorage() {
    console.log("\x1b[32m", "Processing: getDataFromEphemeralStorage() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'GET',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/ephemeral_storage/' + wasm_object.get_ephemeral_storage_key(),
                'headers': {},
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    if (body.toString().includes("25")) {
                        printMessage("Success, data is: " + body.toString()).then((printResult) => {});
                    } else {
                        printMessage("Error, data from getDataFromEphemeralStorage test is not correct: " + body.toString()).then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Add data to ephemeral storage
function updateDataToEphemeralStorage() {
    console.log("\x1b[32m", "Processing: updateDataToEphemeralStorage() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'PUT',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/ephemeral_storage/' + wasm_object.get_ephemeral_storage_key(),
                'headers': {
                    'Content-Type': 'application/json'
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    console.log(body.toString());
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            var postData = JSON.stringify({
                "asdf": 88888888
            });
            req.write(postData);
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Add data to ephemeral storage
function getDataFromEphemeralStorage2() {
    console.log("\x1b[32m", "Processing: getDataFromEphemeralStorage2() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'GET',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/ephemeral_storage/' + wasm_object.get_ephemeral_storage_key(),
                'headers': {},
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    if (body.toString().includes("88888888")) {
                        printMessage("Success, the data is: " + body.toString()).then((printResult) => {});
                    } else {
                        printMessage("Error, data from getDataFromEphemeralStorage2 test is not correct: " + body.toString()).then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Delete the wasm executable (clean up after tests)
function deleteDataFromEphemeralStorage() {
    console.log("Processing: deleteDataFromEphemeralStorage() ...");
    return new Promise(function(resolve, reject) {
        try {
            var path_to_delete_wasm = "/api/executables/" + wasm_object.get_wasm_id();
            var admin_key_required_for_deletion = wasm_object.get_SSVM_Admin_Key();
            var options = {
                'method': 'DELETE',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/ephemeral_storage/' + wasm_object.get_ephemeral_storage_key(),
                'headers': {},
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    printMessage(body.toString()).then((printResult) => {});
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            req.end();
        } catch {
            console.log("\x1b[31m", "Error: deleteDataFromEphemeralStorage failed");
            reject();
        }
    });
}

// ************************************************************************************************
// Add data to ephemeral storage
function getDataFromEphemeralStorage3() {
    console.log("\x1b[32m", "Processing: getDataFromEphemeralStorage3() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'GET',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/ephemeral_storage/' + wasm_object.get_ephemeral_storage_key(),
                'headers': {},
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    if (body.toString().includes("Key not found")) {
                        printMessage("Success, the data is not available (because we just deleted it for this test)").then((printResult) => {});
                    } else {
                        printMessage("Error, data from getDataFromEphemeralStorage3 test is not correct: " + body.toString()).then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Add data to ephemeral storage
function refreshUsageKeys() {
    console.log("\x1b[32m", "Processing: refreshUsageKeys() ...");
    var id_to_use = wasm_object.get_wasm_id();
    var original_ssvm_usage_key = wasm_object.get_SSVM_Usage_Key();
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'PUT',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/keys/' + id_to_use + '/usage_key',
                'headers': {
                    'SSVM_Admin_Key': wasm_object.get_SSVM_Admin_Key(),
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var o = JSON.parse(body.toString());
                    wasm_object.set_SSVM_Usage_Key(o["SSVM_Usage_Key"]);
                    if (wasm_object.get_SSVM_Usage_Key() != original_ssvm_usage_key) {
                        printMessage("Success, we have updated the usage key from " + original_ssvm_usage_key + " to " + wasm_object.get_SSVM_Usage_Key()).then((printResult) => {});
                    } else if (wasm_object.get_SSVM_Usage_Key() == original_ssvm_usage_key) {
                        printMessage("Error, the  " + wasm_object.get_SSVM_Usage_Key() + " was not updated").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Add data to ephemeral storage
function zeroUsageKeys() {
    console.log("\x1b[32m", "Processing: zeroUsageKeys() ...");
    var id_to_use = wasm_object.get_wasm_id();
    var original_ssvm_usage_key = wasm_object.get_SSVM_Usage_Key();
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'DELETE',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/keys/' + id_to_use + '/usage_key',
                'headers': {
                    'SSVM_Admin_key': wasm_object.get_SSVM_Admin_Key(),
                },
                'maxRedirects': 20
            };

            var req = https.request(options, function(res) {
                var chunks = [];

                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    var o = JSON.parse(body.toString());
                    wasm_object.set_SSVM_Usage_Key(o["SSVM_Usage_Key"]);
                    console.log(body.toString());
                    if (wasm_object.get_SSVM_Usage_Key() != original_ssvm_usage_key) {
                        printMessage("Success, we have updated the usage key from " + original_ssvm_usage_key + " to " + wasm_object.get_SSVM_Usage_Key()).then((printResult) => {});
                    } else if (wasm_object.get_SSVM_Usage_Key() == original_ssvm_usage_key) {
                        printMessage("Error, the  " + wasm_object.get_SSVM_Usage_Key() + " was not updated").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });

            req.end();
        } catch {
            reject();
        }
    });
}

// ************************************************************************************************
// Delete the wasm executable (clean up after tests)
function deleteExecutable() {
    console.log("Processing: deleteExecutable() ...");
    return new Promise(function(resolve, reject) {
        try {
            var path_to_delete_wasm = "/api/executables/" + wasm_object.get_wasm_id();
            var admin_key_required_for_deletion = wasm_object.get_SSVM_Admin_Key();
            var options = {
                'method': 'DELETE',
                'hostname': joey_instance,
                'port': 8081,
                'path': path_to_delete_wasm,
                'headers': {
                    'SSVM_Admin_Key': admin_key_required_for_deletion
                },
                'maxRedirects': 20
            };
            var req = https.request(options, function(res) {
                var chunks = [];
                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function(chunk) {
                    var body = Buffer.concat(chunks);
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            req.end();
        } catch {
            console.log("\x1b[31m", "Error: deleteExecutable failed");
            reject();
        }
    });
}


// ************************************************************************************************
// Execute the tests
loadExecutable().then((loadExecutableResult) => {
    loadExecutableAverage().then((loadExecutableAverageResult) => {
        loadExecutableCF().then((loadExecutableCFResult) => {
            updateExecutable().then((loadExecutableResult) => {
                updateExecutableAdminKey().then((loadExecutableResult) => {
                    getExecutable().then((getExecutableResult) => {
                        getExecutableFilterByDescription().then((ggetExecutableFilterByDescriptionResult) => {
                            getExecutableFilterBySha256().then((getExecutableFilterBySha256Result) => {
                                executeExecutablesFunction().then((executeExecutablesFunctionResult) => {
                                    executeExecutablesFunctionWithHeaderFetch().then((executeExecutablesFunctionResult) => {
                                        executeExecutablesFunctionWithBodyFetch().then((executeExecutablesFunctionResult) => {
                                            executeExecutablesFunctionWithHeaderCallback().then((executeExecutablesFunctionResult) => {
                                                executeExecutablesFunctionWithBodyCallback().then((executeExecutablesFunctionResult) => {
                                                    executeExecutablesFunctionWithBodyCallback2().then((executeExecutablesFunctionResult) => {
                                                        addDataToEphemeralStorage().then((addDataToEphemeralStorageResult) => {
                                                            getDataFromEphemeralStorage().then((getDataFromEphemeralStorageResult) => {
                                                                updateDataToEphemeralStorage().then((updateDataToEphemeralStorageResult) => {
                                                                    getDataFromEphemeralStorage2().then((getDataFromEphemeralStorage2Result) => {
                                                                        deleteDataFromEphemeralStorage().then((deleteDataFromEphemeralStorageResult) => {
                                                                            getDataFromEphemeralStorage3().then((getDataFromEphemeralStorage3Result) => {
                                                                                refreshUsageKeys().then((refreshUsageKeysResult) => {
                                                                                    zeroUsageKeys().then((zeroUsageKeysResult) => {
                                                                                        deleteExecutable().then((deleteExecutableResult) => {});
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// TODO 
// STATE (string JSON etc.) - Must be string
// POST bytes
// callback
// multipart