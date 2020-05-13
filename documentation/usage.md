# wasm-joey Usage

Once deployed wasm-joey performs tasks which are all defined as service endpoints (URLs). These tasks/services include the following ...
- Set Wasm executable
- Get Wasm executable
- Execute Wasm executable
- Update Wasm executable
- Remove Wasm executable


# Storage
wasm-joey (using MySQL) stores the actual executable Wasm binary code, as well as all other information relating to execution (who, what, when etc.). This information can be used to generate usage reports, auditing and so forth.

# Request / Response

## Request data specifications
Please read the following request types (load, read, execute, update, delete) and take note of the data specifications. We provide examples for each.

### Set a Wasm executable in hex format
Set a Wasm binary into the system and return a freshly minted `wasm_id` back to the calling code
```
POST
```
Endpoint
scheme `https`, netloc `rpc.ssvm.secondstate.io`, port `3000`, path `executables`
```
https://rpc.ssvm.secondstate.io:3000/executables
```
Header
Content-Type
```
Content-Type: application/json
```
Body
Wasm binary can be converted to hexadecimal string using the following command
```
 xxd -p wasm_file.wasm | tr -d $'\n'
```
The hexadecimal string can then be passed into wasm-joey for future execution
```
{"wasm_binary": "0x1234567890"}
```
Curl example
```
curl --location --request POST https://rpc.ssvm.secondstate.io:3000/executables' \
--header 'Content-Type: application/json' \
--data-raw '{"wasm_binary":"0x1234567890"}'
```
### Get a Wasm in hex format
Get a Wasm binary which has a certain `wasm_id` and return that specific Wasm binary back to the calling code
```
```
### Execute a Wasm function
Execute a specific function which resides in a Wasm executable. The Wasm executable must have previously been set/updated into the wasm-joey system and will be identified by its `wasm_id`
Request Type
```
POST
```
Endpoint
scheme `https`, netloc `rpc.ssvm.secondstate.io`, port `3000`, path `executables`, wasm_id `1`
```
https://rpc.ssvm.secondstate.io:3000/executables/1
```
Header
Content-Type
```
Content-Type: application/json
```
Body
```
{"wasm_method":"add", "params":[1, 2]}
```
Curl example
```
curl --location --request POST 'https://rpc.ssvm.secondstate.io:3000/executables/1' \
--header 'Content-Type: application/json' \
--data-raw '{"method":"add", "params":[1, 2]}'
```

### Update (Hot Swap) a Wasm executable
Remove and replace an existing Wasm executable in hex format. Future execute calls will of course run this new executable's logic
```
PUT
```
Endpoint
scheme `https`, netloc `rpc.ssvm.secondstate.io`, port `3000`, path `executables`, wasm_id `1`
```
https://rpc.ssvm.secondstate.io:3000/executables/1
```
Header
Content-Type
```
Content-Type: application/json
```
Body
```
{"wasm_method":"add", "params":[1, 2]}
```
Curl example
```
curl --location --request POST 'https://rpc.ssvm.secondstate.io:3000/executables/1' \
--header 'Content-Type: application/json' \
--data-raw '{"method":"add", "params":[1, 2]}'
```
### Delete a Wasm executable
Delete an existing Wasm executable in hex format, from the system
```
```


# Request overview - using different languages to create HTTP request
wasm-joey is designed to accept HTTP requests from any software which is capable of creating a valid request. The data payload for the request following a convention.

```
```

Here are some examples of usage in different calling languages

## Javascript
Calling with client-side Javascript using Javascript XMLHttpRequest
```javascript
var url = "https://rpc.ssvm.secondstate.io:3000";

var xhr = new XMLHttpRequest();
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-Type", "application/json");
var data = {

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
>>> url = "https://rpc.ssvm.secondstate.io:3000"
>>> data = {} 
>>> r = requests.get(url=url, params=data)
```

## Curl
```bash
curl --header "Content-Type: application/json" \                     
--request POST \
--data '{}' \
http://13.211.208.187:8080
```


## Response data specifications
