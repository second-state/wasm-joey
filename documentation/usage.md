# Wasm-joey Usage

Once deployed Wasm-joey performs tasks which are all defined as service endpoints (URLs). These tasks/services include the following ...
- Load Wasm executable
- Read Wasm executable
- Execute Wasm executable
- Update Wasm executable
- Remove Wasm executable


# Storage
Wasm-joey (using MySQL) stores the actual executable Wasm binary code, as well as all other information relating to execution (who, what, when etc.). This information can be used to generate usage reports, auditing and so forth.

# Request data specifications
When a request is made Wasm-joey expects to see certain parameters in the request object. For example if you want to load a wasm binary then you need to provide a `wasm_binary` field in your request. This is very straight forward and simple to understand. Here are the examples of JSON that you will send in.

## Read a Wasm executable
Give me the Wasm which has the `wasm_id` of `2`
```
{"jsonrpc": "2.0", "method":"read_wasm_executable", "params":[{"wasm_id": "2"}], "id": 1}
```
## Load a Wasm executable
Load this Wasm into the system and give me back the `wasm_id` for future use.
```
{"jsonrpc": "2.0", "method":"load_wasm_executable", "params":[{"wasm_description": "Test description", "wasm_binary": "0x1234567890"}], "id": 1}
```
## Remove a Wasm executable
Remove the Wasm from the system which has a `wasm_id` of `1`
```
{"jsonrpc": "2.0", "method":"remove_wasm_executable", "params":[{"wasm_id": "1"}], "id": 1}
```

## Update (Hot Swap) a Wasm executable
Update the `wasm_binary` to this new `wasm_binary` which we are providing here, where the `wasm_id` is `2`
```
{"jsonrpc": "2.0", "method":"update_wasm_executable", "params":[{"wasm_id": "2", "wasm_binary": "0x0987654321"}], "id": 1}
```

# Request overview - using different languages to create HTTP request
Wasm-joey is designed to accept HTTP requests from any software which is capable of creating a valid request. The data payload for the request following a convention.

For a quick test, you can just `ping` Wasm-joey to make sure it is working. This requires no parameters; just the following simple JSON object.
```
{"jsonrpc": "2.0", "method":"ping", "params":[], "id": 1}
```

Here are some examples of usage in different calling languages

## Javascript
Calling with client-side Javascript using Javascript XMLHttpRequest
```javascript
var url = "http://13.211.208.187:8080";

var xhr = new XMLHttpRequest();
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-Type", "application/json");
var data = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "ping"
};
xhr.onload = function(e) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            console.log(xhr.response)
        }
    }
};
xhr.open("POST", url, true);
xhr.send(JSON.stringify(data));
```

## Python
```python
>>> import requests
>>> url = "http://13.211.208.187:8080"
>>> data = {"jsonrpc": "2.0", "method":"ping", "params":[], "id": 1} 
>>> r = requests.get(url=url, params=data)
```

## Curl
```bash
curl --header "Content-Type: application/json" \                     
--request POST \
--data '{
"jsonrpc": "2.0", 
"method":"ping", 
"params":[], 
"id": 1}' \
http://13.211.208.187:8080
```


# Response
