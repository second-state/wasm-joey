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
#### Verb
```
POST
```
#### Endpoint
scheme `https`, netloc `rpc.ssvm.secondstate.io`, port `3000`, path `executables`
```
https://rpc.ssvm.secondstate.io:3000/executables
```
#### Header
Content-Type
```
Content-Type: application/json
```
#### Body
Wasm binary can be converted to hexadecimal string using the following command. Please ensure to add the `0x` to the start of the string as shown, in the request JSON, below.
```
 xxd -p wasm_file.wasm | tr -d $'\n'
```
The hexadecimal string can then be passed into wasm-joey for future execution
```
{"wasm_binary": "0x1234567890"}
```
#### Curl example
```
curl --location --request POST https://rpc.ssvm.secondstate.io:3000/executables' \
--header 'Content-Type: application/json' \
--data-raw '{"wasm_binary":"0x1234567890"}'
```
#### Response
The above request will return a response in the following JSON format 
```
{"wasm_id":8}
```
### Get all Wasm executables (as list) 
Get all Wasm executables and return that list back to the calling code
#### Verb
```
GET
```
#### Endpoint
scheme `https`, netloc `rpc.ssvm.secondstate.io`, port `3000`, path `executables`
```
https://rpc.ssvm.secondstate.io:3000/executables
```
#### Body
No body required
#### Curl example
```
curl --location --request GET 'https://rpc.ssvm.secondstate.io:3000/api/executables' \
--header 'Content-Type: application/json' \
--data-raw ''
```
#### Response
```
[{
	"wasm_id": 1,
	"wasm_description": "System generated entry for testing"
}, {
	"wasm_id": 2,
	"wasm_description": "Put here by the API"
}, {
	"wasm_id": 3,
	"wasm_description": "Put here by the API"
}, {
	"wasm_id": 4,
	"wasm_description": "Put here by the API"
}, {
	"wasm_id": 5,
	"wasm_description": "Put here by the API"
}]
```

### Get a specific Wasm executable 
Get a Wasm binary which has a certain `wasm_id` and return that specific Wasm executable back to the calling code as a Buffer
#### Verb
```
GET
```
#### Endpoint
scheme `https`, netloc `rpc.ssvm.secondstate.io`, port `3000`, path `executables`, `wasm_id`
```
https://rpc.ssvm.secondstate.io:3000/executables/14
```
#### Body
No body required
#### Curl example
```
curl --location --request GET 'https://rpc.ssvm.secondstate.io:3000/api/executables/14' \
--header 'Content-Type: application/json' \
--data-raw ''
```
#### Response
```
{"wasm_id":14,"wasm_description":"Put here by the API","wasm_as_hex":"0x1234567890","wasm_as_buffer":{"type":"Buffer","data":[48,120,49,50,51,52,53,54,55,56,57,48]}}
```
### Get a specific Wasm executable - with optional filtering
The following query string syntax will filter the response to ONLY return the fields which are explicitly listed.
For example the following syntax will only return the `wasm_id` field
```
https://rpc.ssvm.secondstate.io:3000/executables/14?filterBy=["wasm_id"]
```
Result
```
{"wasm_id":14}
```
The following syntax will only return `wasm_as_hex` and `wasm_description` 
```
https://rpc.ssvm.secondstate.io:3000/executables/14?filterBy=["wasm_as_hex", "wasm_description"]
```
Result
```
{"wasm_as_hex":"0x1234567890","wasm_description":"Put here by the API"}
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
