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

var options = {
    'method': 'POST',
    'hostname': 'rpc.ssvm.secondstate.io',
    'port': 8081,
    'path': '/api/run/21/reverse',
    'headers': {
        'Content-Type': 'text/plain'
    },
    'maxRedirects': 20
};

// ************************************************************************************************
// Add data to ephemeral storage
function addDataToEphemeralStorage() {
    console.log("\x1b[32m", "Processing: addDataToEphemeralStorage() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': 'rpc.ssvm.secondstate.io',
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
                'hostname': 'rpc.ssvm.secondstate.io',
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
                'hostname': 'rpc.ssvm.secondstate.io',
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
                'hostname': 'rpc.ssvm.secondstate.io',
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
    updateExecutable().then((loadExecutableResult) => {
        updateExecutableAdminKey().then((loadExecutableResult) => {
            getExecutable().then((getExecutableResult) => {
                getExecutableFilterByDescription().then((ggetExecutableFilterByDescriptionResult) => {
                    getExecutableFilterBySha256().then((getExecutableFilterBySha256Result) => {
                        executeExecutablesFunction().then((executeExecutablesFunctionResult) => {
                            addDataToEphemeralStorage().then((addDataToEphemeralStorageResult) => {
                                getDataFromEphemeralStorage().then((getDataFromEphemeralStorageResult) => {
                                    updateDataToEphemeralStorage().then((updateDataToEphemeralStorageResult) => {
                                        getDataFromEphemeralStorage2().then((getDataFromEphemeralStorage2Result) => {
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

// Checks for writing tests
// Are headers correct in the request?
// Are the correct REST verbs being used i.e GET vs POST

// TODO 
// STATE (string JSON etc.) - Must be string
// POST bytes
// Flush Usage key to 0
// Recreate Usage key
// fetch in header
// fetch in body
// callback
// multipart