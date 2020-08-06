// ************************************************************************************************
// Joey production instance
//const joey_instance = "rpc.ssvm.secondstate.io";
// Joey development instanance
const joey_instance = "dev.rpc.ssvm.secondstate.io";

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
var wasm_object_multipart = new WasmObject();
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
        } catch (e) {
            reject();
        }
    });
}

// ************************************************************************************************
// Load a new wasm executable
function loadExecutableMultipart() {
    console.log("\x1b[32m", "Processing: loadExecutableMultipart() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/executables',
                'headers': {
                    'Content-Type': 'application/octet-stream',
                    'SSVM_Description': 'Multipart'
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
                    wasm_object_multipart.set_wasm_id(res_object["wasm_id"]);
                    wasm_object_multipart.set_SSVM_Admin_Key(res_object["SSVM_Admin_Key"]);
                    wasm_object_multipart.set_SSVM_Usage_Key(res_object["SSVM_Usage_Key"]);
                    wasm_object_multipart.set_wasm_sha256(res_object["wasm_sha256"]);
                    console.log("\x1b[32m", "wasm_id:" + wasm_object_multipart.get_wasm_id());
                    console.log("\x1b[32m", "SSVM_Admin_Key:" + wasm_object_multipart.get_SSVM_Admin_Key());
                    console.log("\x1b[32m", "SSVM_Usage_Key:" + wasm_object_multipart.get_SSVM_Usage_Key());
                    console.log("\x1b[32m", "wasm_sha256:" + wasm_object_multipart.get_wasm_sha256());
                    resolve();
                });
                res.on("error", function(error) {
                    printMessage(body.toString()).then((printResult) => {
                        resolve();
                    });
                });
            });
            var postData = fs.readFileSync('./multipart_bg.wasm');
            req.write(postData);
            req.end();
        } catch (e) {
            reject();
        }
    });
}

// ************************************************************************************************
// Execute a wasm executable's function
/*
curl --location --request POST 'https://dev.rpc.ssvm.secondstate.io:8081/api/multipart/run/116/process_three_inputs' \
--header 'Content-Type: multipart/form-data' \
--form 'first_input_example_1=one' \
--form 'second_input_example_2={"asdf": 10}' \
--form 'third_parameter_3=2'
*/
function executeExecutablesMultipart1() {
    var id_to_use = wasm_object_multipart.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesMultipart1() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/multipart/run/' + id_to_use + '/process_three_inputs',
                'headers': {
                    'Content-Type': 'multipart/form-data'
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
                    body_object = JSON.parse(body.toString());

                    console.log(body.toString());

                    console.log("input_a: " + body_object.input_a);
                    console.log("input_b: " + body_object.input_b);
                    console.log("input_c: " + body_object.input_c);

                    if (body_object.input_a == "one" && body_object.input_b === "{\"asdf\": 10}" && body_object.input_c === "2") {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesMultipart1() test").then((printResult) => {});
                    }

                    resolve();
                });

                res.on("error", function(error) {
                    console.error(error);
                });
            });

            var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"first_input_example_1\"\r\n\r\none\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"second_input_example_2\"\r\n\r\n{\"asdf\": 10}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"third_parameter_3\"\r\n\r\n2\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";

            req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');

            req.write(postData);

            req.end();
        } catch (e) {
            reject();
        }
    });
}

// ************************************************************************************************
// Execute a wasm executable's function
// GET
/*
curl --location --request POST 'https://dev.rpc.ssvm.secondstate.io:8081/api/multipart/run/116/process_three_inputs' \
--header 'Content-Type: multipart/form-data' \
--form 'first_input_example_1=one' \
--form 'second_input_example_2={"asdf": 10}' \
--form 'fetch_again_3=https://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt'
*/
function executeExecutablesMultipart2() {
    var say_id_to_use = wasm_object.get_wasm_id();
    var id_to_use = wasm_object_multipart.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesMultipart2() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/multipart/run/' + id_to_use + '/process_three_inputs',
                'headers': {
                    'Content-Type': 'multipart/form-data'
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
                    body_object = JSON.parse(body.toString());

                    console.log(body.toString());

                    console.log("input_a: " + body_object.input_a);
                    console.log("input_b: " + body_object.input_b);
                    console.log("input_c: " + body_object.input_c);

                    if (body_object.input_a == "one" && body_object.input_b === "{\"asdf\": 10}" && body_object.input_c === "Tim\n") {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesMultipart2() test").then((printResult) => {});
                    }

                    resolve();
                });

                res.on("error", function(error) {
                    console.error(error);
                });
            });

            var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"first_input_example_1\"\r\n\r\none\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"second_input_example_2\"\r\n\r\n{\"asdf\": 10}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"fetch_again_3\"\r\n\r\nhttps://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";
            req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');

            req.write(postData);

            req.end();
        } catch (e) {
            reject();
        }
    });
}

// ************************************************************************************************
// Execute a wasm executable's function
// GET and CALLBACK
/*
curl --location --request POST 'https://dev.rpc.ssvm.secondstate.io:8081/api/multipart/run/180/process_three_inputs' \
--header 'Content-Type: multipart/form-data' \
--form 'first_input_example_1=one' \
--form 'second_input_example_2={"asdf": 10}' \
--form 'fetch_again_3=https://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt' \
--form 'SSVM_Callback={"body": "asdf", "hostname":"dev.rpc.ssvm.secondstate.io","path": "/api/run/wasm_id/say", "method": "POST","port": 8081,"headers": {"Content-Type": "text/plain"}}'
*/
function executeExecutablesMultipart2_1() {
    var say_id_to_use = wasm_object.get_wasm_id();
    var id_to_use = wasm_object_multipart.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesMultipart2_1() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/multipart/run/' + id_to_use + '/process_three_inputs',
                'headers': {
                    'Content-Type': 'multipart/form-data'
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
                    //body_object = JSON.parse(body.toString());

                    console.log(body.toString());
                    /*

                    console.log("input_a: " + body_object.input_a);
                    console.log("input_b: " + body_object.input_b);
                    console.log("input_c: " + body_object.input_c);

                    if (body_object.input_a == "one" && body_object.input_b === "{\"asdf\": 10}" && body_object.input_c === "Tim\n") {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesMultipart2_1() test").then((printResult) => {});
                    }
                    */

                    resolve();
                });

                res.on("error", function(error) {
                    console.error(error);
                });
            });

            var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"first_input_example_1\"\r\n\r\none\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"second_input_example_2\"\r\n\r\n{\"asdf\": 10}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"fetch_again_3\"\r\n\r\nhttps://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"SSVM_Callback\"\r\n\r\n{\"body\": \"asdf\", \"hostname\":\"dev.rpc.ssvm.secondstate.io\",\"path\": \"/api/run/179/say\", \"method\": \"POST\",\"port\": 8081,\"headers\": {\"Content-Type\": \"text/plain\"}}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";
            
            req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');

            req.write(postData);

            req.end();
        } catch (e) {
            reject();
        }
    });
}


// ************************************************************************************************
// Execute a wasm executable's function 
// POST AND GET
/*
curl --location --request POST 'https://dev.rpc.ssvm.secondstate.io:8081/api/multipart/run/116/process_three_inputs' \
--header 'Content-Type: multipart/form-data' \
--form 'first_input_example_1=one' \
--form 'fetch_input_example_2={"body": "asdf", "hostname":"rpc.ssvm.secondstate.io","path": "/api/run/1/say", "method": "POST","port": 8081,"headers": {"Content-Type": "text/plain"}}' \
--form 'fetch_again_3=https://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt'
*/
function executeExecutablesMultipart3() {
    var say_id_to_use = wasm_object.get_wasm_id();
    var id_to_use = wasm_object_multipart.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesMultipart3() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/multipart/run/' + id_to_use + '/process_three_inputs',
                'headers': {
                    'Content-Type': 'multipart/form-data'
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
                    console.log("Body as String: " + body.toString());
                    body_object = JSON.parse(body.toString());

                    console.log(body.toString());

                    console.log("input_a: " + body_object.input_a);
                    console.log("input_b: " + body_object.input_b);
                    console.log("input_c: " + body_object.input_c);

                    if (body_object.input_a == "one" && body_object.input_b === "hello \"asdf\"" && body_object.input_c === "Tim\n") {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesMultipart3() test").then((printResult) => {});
                    }

                    resolve();
                });

                res.on("error", function(error) {
                    console.error(error);
                });
            });

            var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"first_input_example_1\"\r\n\r\none\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"fetch_input_example_2\"\r\n\r\n{\"body\": \"asdf\", \"hostname\":\"" + joey_instance + "\",\"path\": \"/api/run/" + say_id_to_use + "/say\", \"method\": \"POST\",\"port\": 8081,\"headers\": {\"Content-Type\": \"text/plain\"}}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"fetch_again_3\"\r\n\r\nhttps://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";
            console.log("\n***********************   POST DATA: " + postData + "\n");
            req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
            req.write(postData);

            req.end();
        } catch (e) {
            reject();
        }
    });
}

// ************************************************************************************************
// Execute a wasm executable's function 
// POST AND GET
/*
curl --location --request POST 'https://dev.rpc.ssvm.secondstate.io:8081/api/multipart/run/116/process_three_inputs' \
--header 'Content-Type: multipart/form-data' \
--form 'first_input_example_1=one' \
--form 'second_input_example_2={"asdf": 10}' \
--form 'fetch_input_example_2={"body": "asdf", "hostname":"rpc.ssvm.secondstate.io","path": "/api/run/1/say", "method": "POST","port": 8081,"headers": {"Content-Type": "text/plain"}}'
*/
function executeExecutablesMultipart4() {
    var say_id_to_use = wasm_object.get_wasm_id();
    var id_to_use = wasm_object_multipart.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesMultipart4() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/multipart/run/' + id_to_use + '/process_three_inputs',
                'headers': {
                    'Content-Type': 'multipart/form-data'
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
                    body_object = JSON.parse(body.toString());

                    console.log(body.toString());

                    console.log("input_a: " + body_object.input_a);
                    console.log("input_b: " + body_object.input_b);
                    console.log("input_c: " + body_object.input_c);

                    if (body_object.input_a == "one" && body_object.input_b === "{\"asdf\": 10}" && body_object.input_c === "hello \"asdf\"") {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesMultipart4() test").then((printResult) => {});
                    }

                    resolve();
                });

                res.on("error", function(error) {
                    console.error(error);
                });
            });

            var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"first_input_example_1\"\r\n\r\none\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"second_input_example_2\"\r\n\r\n{\"asdf\": 10}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"fetch_input_example_2\"\r\n\r\n{\"body\": \"asdf\", \"hostname\":\"" + joey_instance + "\",\"path\": \"/api/run/" + say_id_to_use + "/say\", \"method\": \"POST\",\"port\": 8081,\"headers\": {\"Content-Type\": \"text/plain\"}}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";
            req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
            req.write(postData);

            req.end();
        } catch (e) {
            reject();
        }
    });
}


// ************************************************************************************************
// Execute a wasm executable's function 
// POST AND GET
/*
curl --location --request POST 'https://dev.rpc.ssvm.secondstate.io:8081/api/multipart/run/116/process_three_inputs' \
--header 'Content-Type: multipart/form-data' \
--form 'first_input_example_1=one' \
--form 'fetch_input_example_2={"body": "asdf", "hostname":"rpc.ssvm.secondstate.io","path": "/api/run/1/say", "method": "POST","port": 8081,"headers": {"Content-Type": "text/plain"}}' \
--form 'fetch_again_3=https://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt' \
--form 'SSVM_Callback={"body": "asdf", "hostname":"rpc.ssvm.secondstate.io","path": "/api/run/1/say", "method": "POST","port": 8081,"headers": {"Content-Type": "text/plain"}}'
*/
function executeExecutablesMultipart5() {
    var say_id_to_use = wasm_object.get_wasm_id();
    var id_to_use = wasm_object_multipart.get_wasm_id();
    console.log("\x1b[32m", "Processing: executeExecutablesMultipart5() ...");
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'POST',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/multipart/run/' + id_to_use + '/process_three_inputs',
                'headers': {
                    'Content-Type': 'multipart/form-data'
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
                    body_object = JSON.parse(body.toString());

                    console.log(body.toString());

                    console.log("input_a: " + body_object.input_a);
                    console.log("input_b: " + body_object.input_b);
                    console.log("input_c: " + body_object.input_c);

                    if (body.toString().startsWith("hello ") && body_object.input_a == "one" && body_object.input_b === "hello \"asdf\"" && body_object.input_c === "Tim\n") {
                        printMessage("Success: Function executed correctly!").then((printResult) => {});
                    } else {
                        printMessage("Error: Function not executed correctly via the executeExecutablesMultipart5() test").then((printResult) => {});
                    }

                    resolve();
                });

                res.on("error", function(error) {
                    console.error(error);
                });
            });

            var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"first_input_example_1\"\r\n\r\none\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"fetch_input_example_2\"\r\n\r\n{\"body\": \"asdf\", \"hostname\":\"" + joey_instance + "\",\"path\": \"/api/run/" + say_id_to_use + "/say\", \"method\": \"POST\",\"port\": 8081,\"headers\": {\"Content-Type\": \"text/plain\"}}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"fetch_again_3\"\r\n\r\nhttps://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"SSVM_Callback\"\r\n\r\n{\"body\": \"asdf\", \"hostname\":\"" + joey_instance + "\",\"path\": \"/api/run/" + say_id_to_use + "/say\", \"method\": \"POST\",\"port\": 8081,\"headers\": {\"Content-Type\": \"text/plain\"}}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";

            req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
            req.write(postData);

            req.end();
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
                    'SSVM_Callback': '{"hostname": "' + joey_instance + '","path": "/api/run/' + id_to_use + '/say","method": "POST","port": 8081,"headers":{"Content-Type": "text/plain"}}',
                    'Content-Type': 'text/plain'
                },
                'maxRedirects': 20
            };
            console.log(options);
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
            reject();
        }
    });
}

// ************************************************************************************************
// Add data to ephemeral storage
function updateCallbackObject() {
    console.log("\x1b[32m", "Processing: updateCallbackObject() ...");
    var id_to_use = wasm_object.get_wasm_id();
    var admin_key_required_for_update = wasm_object.get_SSVM_Admin_Key();
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'PUT',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/callback/' + id_to_use,
                'headers': {
                    'Content-Type': 'application/json',
                    'SSVM_Admin_Key': admin_key_required_for_update
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
                    if (body.toString().includes("Not allowed to store a callback to the rpc.ssvm.secondstate.io hostname")) {
                        printMessage("Success, we have confirmed that callbacks to this server can not be stored in the DB").then((printResult) => {});
                    } else {
                        printMessage("Error, we should not be allowed to store this type of callback object").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            var postData = JSON.stringify({
                "hostname": "rpc.ssvm.secondstate.io",
                "path": "/api/run/5/reverse/bytes",
                "method": "POST",
                "port": 8081,
                "headers": {
                    "Content-Type": "application/octet-stream"
                }
            });
            req.write(postData);
            req.end();
        } catch (e) {
            reject();
        }
    });
}

// ************************************************************************************************
// Add data to ephemeral storage
function updateCallbackObject2() {
    console.log("\x1b[32m", "Processing: updateCallbackObject2() ...");
    var id_to_use = wasm_object.get_wasm_id();
    var admin_key_required_for_update = wasm_object.get_SSVM_Admin_Key();
    return new Promise(function(resolve, reject) {
        try {
            var options = {
                'method': 'PUT',
                'hostname': joey_instance,
                'port': 8081,
                'path': '/api/callback/' + id_to_use,
                'headers': {
                    'Content-Type': 'application/json',
                    'SSVM_Admin_Key': admin_key_required_for_update
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
                    if (body.toString().includes(id_to_use)) {
                        printMessage("Success, we have updated the callback object which is stored in the DB").then((printResult) => {});
                    } else {
                        printMessage("Error, we should not be allowed to store this type of callback object").then((printResult) => {});
                    }
                    resolve();
                });
                res.on("error", function(error) {
                    console.error(error);
                });
            });
            // Just adding a blank object for testing
            var postData = JSON.stringify({});
            req.write(postData);
            req.end();
        } catch (e) {
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
        } catch (e) {
            console.log("\x1b[31m", "Error: deleteExecutable failed");
            reject();
        }
    });
}


// ************************************************************************************************
// Execute the tests
loadExecutable().then((loadExecutableResult) => {
    loadExecutableMultipart().then((loadExecutableResult) => {
        executeExecutablesMultipart1().then((loadExecutableResult) => {
            executeExecutablesMultipart2().then((loadExecutableResult) => {
                executeExecutablesMultipart2_1().then((loadExecutableResult) => {
                executeExecutablesMultipart3().then((loadExecutableResult) => {
                    executeExecutablesMultipart4().then((loadExecutableResult) => {
                        executeExecutablesMultipart5().then((loadExecutableResult) => {
                            /*loadExecutableAverage().then((loadExecutableAverageResult) => {
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
                                                                                                                updateCallbackObject().then((zeroUsageKeysResult) => {
                                                                                                                    updateCallbackObject2().then((zeroUsageKeysResult) => {
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
                            });*/
                        });
 });
                    });
                });
            });
        });
    });
});

// TODO 
// Native storage
// STATE (string JSON etc.) - Must be string
// POST bytes (including callbacks in header and body)
// multipart (including fetch, get, post and callbacks as parts)