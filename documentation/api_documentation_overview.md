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