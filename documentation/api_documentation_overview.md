# API documentation in OpenAPI 3.0.1 syntax
The following are all OpenAPI entries which we will use to create the swagger API documentation

## Header to be used once
```
openapi: 3.0.1
info:
  title: WASM JOEY
  description: WASM JOEY - API Documentation
  version: '0.1'
servers:
  - url: 'https://rpc.ssvm.secondstate.io:8081'
```

## Path header 
```
paths:
```
## Individual paths (each to be used once under the main header)

### /api/executables
Get the wasm_id of all the executables
```
/api/executables:
get:
  description: Get all executables (returns wasm_id only)
  responses:
    '200':
      description: Get all executables
      content:
        text/html; charset=utf-8:
          schema:
            type: string
          examples: {}
  servers:
    - url: 'https://rpc.ssvm.secondstate.io:8081'
```
### /api/executables/:wasm_id
Get a single wasm executable and filter so only wasm_id is returned
```
  /api/executables/1:
    get:
      description: Auto generated using Swagger Inspector
      parameters:
        - name: filterBy
          in: query
          schema:
            type: string
          example: '["wasm_id"]'
      responses:
        '200':
          description: Get single executable (and filter by wasm_id)
          content:
            application/json; charset=utf-8:
              schema:
                type: string
              examples: {}
      servers:
        - url: 'https://rpc.ssvm.secondstate.io:8081'
    servers:
      - url: 'https://rpc.ssvm.secondstate.io:8081'
```