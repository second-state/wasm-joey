
# Wasm-joey
A Joey is a baby Kangaroo. Wasm-joey is a **portable**, **flexible**, **lightweight** application for deploying and executing WebAssembly(Wasm) binary-code via HTTP requests and responses.

![Image of Joey](images/wasm-joey-tiny.jpg)

Wasm-joey is written in Node.js. It is bundled with all of its dependencies for quick and easy deployment. All configuration is stored in the application's base directory. It can be deployed on any machine that can run Node. It's continual operation is performed via HTTP requests and responses. This means that developers, end users and even computer-code itself can easily manage and execute WebAssembly code in a number of ways (including but not limited to) [Javascript (XMLHttpRequest)](https://www.w3schools.com/xml/xml_http.asp), [jQuery(ajax)](https://api.jquery.com/jquery.ajax/), [Curl (command line/shell)](https://curl.haxx.se/docs/httpscripting.html#POST) or any HTTP REST client such as [Postman](https://www.postman.com/).

Once deployed Wasm-joey performs tasks which are all defined as service endpoints (URLs). These tasks/services include the following ...
- Load Wasm executable
- Execute Wasm executable
- Update Wasm executable
- Remove Wasm executable

# Storage
Wasm-joey (using MySQL) stores the actual executable Wasm binary code, as well as all other information relating to execution (who, what, when etc.). This information can be used to generate usage reports, auditing and so forth.

# Simplicity
"Any program is only as good as it is useful" - Linus Torvalds. This application is being built to be as useful as possible. Part of achieving this involves putting in extra effort and design to ensure that it is as simple as possible, for you to use. Please create an issue if you have any ideas on how this application can be improved. 
