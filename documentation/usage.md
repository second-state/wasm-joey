# Wasm-joey Usage

Once deployed Wasm-joey performs tasks which are all defined as service endpoints (URLs). These tasks/services include the following ...
- Load Wasm executable
- Execute Wasm executable
- Update Wasm executable
- Remove Wasm executable


# Storage
Wasm-joey (using MySQL) stores the actual executable Wasm binary code, as well as all other information relating to execution (who, what, when etc.). This information can be used to generate usage reports, auditing and so forth.

# Requests
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
