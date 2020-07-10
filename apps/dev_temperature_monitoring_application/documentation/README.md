Shows:
- how remote 3rd-party sensors (like Raspberry Pi units) can send (and store) their output via HTTP POST requests to a [central processing platform](https://github.com/second-state/wasm-joey)
- how a remote 3rd-party application can access this remote 3rd-party sensor data (also via HTTP POST requests)
- how a remote 3rd-party application can execute programmable logic (via [a high-performance WebAssembly (Wasm) Virtual Machine (VM)](https://github.com/second-state/SSVM)) on this 3rd-party sensor data

Benefits
This system allows remote, distributed sensors./systems to interoperate. This system shifts storage, computation and network activity from the thin client (sensor) to the server side.
- This system can fetch remote data on behalf of the thin client (using only the server's bandwidth)
- This system can store data on behalf of the thin client (using only the server's memory & storage)
- This system can perform custom programmable logic on behalf of the thin client (Wasm executables called by the thin client via HTTP POST requests)
- This system facilitates pre-computation (can perform GET and POST before executing programmable logic; uses GET/POST output as input for execution)
- This system facilitates post-computation a.k.a. callbacks and custom callbacks (Webhooks) whereby HTTP POST request can be performed after execution on the VM

This specific example sees 5 seperate sensors send their temperatures in Degrees Celsius to the system. This example also shows a gauge which makes a HTTP POST request to the system to calculate the average of the 5 sensors (in Degrees Celsius) and then executes a callback which converts the Celsius to Fahrenheit, before finally displaying the result.

Calculations / updates are performed every 1000 milliseconds.
