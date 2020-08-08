# Run 
```bash
node tests.js 
```

# Output

## Green text (passing tests)

Green output indicates success.
For example ...

```diff
+Processing: loadExecutable() ...
+wasm_id:248
+SSVM_Admin_Key:2b8647f8-03cf-48d3-b9cf-98e5e7ae6d19
+SSVM_Usage_Key:00000000-0000-0000-0000-000000000000
+wasm_sha256:0x544031db56e706a151c056f6f673abfb1f8f158389e51a77cc99a53b849e1c14
+Processing: loadExecutableMultipart() ...
+wasm_id:249
+SSVM_Admin_Key:5113338c-a18a-4167-ad0d-c4e70d169f88
+SSVM_Usage_Key:00000000-0000-0000-0000-000000000000
+wasm_sha256:0x8d62accad265dead35532ebb997997d12b777c358717bcfa4fe3e6da556d2125
+Processing: executeExecutablesMultipart1() ...
+{"input_a":"one","input_b":"{\"asdf\": 10}","input_c":"2"}
+input_a: one
+input_b: {"asdf": 10}
+input_c: 2
+Success: Function executed correctly!
+Processing: executeExecutablesMultipart2() ...
+{"input_a":"one","input_b":"{\"asdf\": 10}","input_c":"Tim\n"}
+input_a: one
+input_b: {"asdf": 10}
+input_c: Tim
+
+Success: Function executed correctly!
+Processing: executeExecutablesMultipart2_1() ...
+Success: Function executed correctly!
+Processing: executeExecutablesMultipart2_2() ...
+Success: Function executed correctly!
+Processing: executeExecutablesMultipart2_3() ...
+Success: Function executed correctly!
+Processing: executeExecutablesMultipart2_4() ...
+{"input_a":"one","input_b":"two","input_c":"\"hello \\\"asdf\\\"\""}
+input_a: one
+input_b: two
+input_c: "hello \"asdf\""
+Success: Function executed correctly!
+Processing: executeExecutablesMultipart2_5() ...
+Success: Function executed correctly!
+Processing: loadExecutableAverage() ...
+wasm_id:250
+SSVM_Admin_Key:c74bdac9-09af-410a-a050-86b34788684d
+SSVM_Usage_Key:00000000-0000-0000-0000-000000000000
+wasm_sha256:0xa296e5d474c26482a921d520b2988e3530c9b184e87a72371ffee788692315d9
+Processing: loadExecutableCF() ...
+wasm_id:251
+SSVM_Admin_Key:cca38f75-0011-4a41-85c6-0a0a5e97ac8b
+SSVM_Usage_Key:00000000-0000-0000-0000-000000000000
+wasm_sha256:0x9e46723ed62017b46416aeed2866a985384af300c779750de574c2a1d55e620a
+Processing: updateExecutable() ...
+{"wasm_id":"248","wasm_sha256":"0x544031db56e706a151c056f6f673abfb1f8f158389e51a77cc99a53b849e1c14"}
+Processing: updateExecutableAdminKey() ...
+Success: Joey detected that this requires an Admin Key
+Processing: getExecutable() ...
+Success: 248
+Processing: getExecutableFilterByDescription() ...
+Wasm description:: Hello
+Processing: getExecutableFilterBySha256() ...
+Wasm sha256:: 0x544031db56e706a151c056f6f673abfb1f8f158389e51a77cc99a53b849e1c14
+Processing: executeExecutablesFunction() ...
+Success: Function executed correctly!
+Processing: executeExecutablesFunctionWithHeaderFetch() ...
+Success: Function executed correctly!
+Processing: executeExecutablesFunctionWithBodyFetch() ...
+Success: Function executed correctly!
+Processing: executeExecutablesFunctionWithHeaderCallback() ...
+{
+method: 'POST',
+hostname: 'dev.rpc.ssvm.secondstate.io',
+port: 8081,
+path: '/api/run/248/say',
+headers: {
+SSVM_Callback: '{"hostname": "dev.rpc.ssvm.secondstate.io","path": "/api/run/248/say","method": "POST","port": 8081,"headers":{"Content-Type": "text/plain"}}',
+'Content-Type': 'text/plain'
+},
+maxRedirects: 20
+}
+Success: Function executed correctly!
+Processing: executeExecutablesFunctionWithBodyCallback() ...
+Success: Function executed correctly!
+Processing: executeExecutablesFunctionWithBodyCallback2() ...
+Success: Function executed correctly!
+Processing: addDataToEphemeralStorage() ...
+Success, key is: 72db4fce-68c3-4f70-af7f-e5df7fbd4e95
+Processing: getDataFromEphemeralStorage() ...
+Success, data is: {"value":{"asdf":25}}
+Processing: updateDataToEphemeralStorage() ...
+{"key":"72db4fce-68c3-4f70-af7f-e5df7fbd4e95"}
+Processing: getDataFromEphemeralStorage2() ...
+Success, the data is: {"value":{"asdf":88888888}}
+Processing: deleteDataFromEphemeralStorage() ...
+{"key":"72db4fce-68c3-4f70-af7f-e5df7fbd4e95"}
+Processing: getDataFromEphemeralStorage3() ...
+Success, the data is not available (because we just deleted it for this test)
+Processing: refreshUsageKeys() ...
+Success, we have updated the usage key from 00000000-0000-0000-0000-000000000000 to 197fd7df-3fe0-4709-a4d0-3d867ec3af71
+Processing: zeroUsageKeys() ...
+{"SSVM_Usage_Key":"00000000-0000-0000-0000-000000000000"}
+Success, we have updated the usage key from 197fd7df-3fe0-4709-a4d0-3d867ec3af71 to 00000000-0000-0000-0000-000000000000
+Processing: updateCallbackObject() ...
+Success, we have confirmed that callbacks to this server can not be stored in the DB
+Processing: updateCallbackObject2() ...
+248
+Success, we have updated the callback object which is stored in the DB
+Processing: deleteExecutable() ...
+{"wasm_id":"248"}
+
 ```
 # Red text (failing tests)
 
Red output indicates failure and requires investigation
For example ...

```diff
-  {"error":"Wrong admin key ... 48 can not be deleted."}
```
