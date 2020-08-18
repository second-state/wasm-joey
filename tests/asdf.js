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
var wasm_object_increment = new WasmObject();
var wasm_object_multipart = new WasmObject();
var wasm_object_average = new WasmObject();
var wasm_object_c_to_f = new WasmObject();
var wasm_object_to_test_bytes = new WasmObject();

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


loadExecutableMultipart().then((loadExecutableResult) => {
executeExecutablesMultipart1().then((loadExecutableResult) => {
});

});
