---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''

---

**Describe the bug**

I was trying to ...


However the following occurred ...

**Endpoint**
Please provide the full endpoint in question i.e. 
```
https://rpc.ssvm.secondstate.io:8081/api/ephemeral_storage/d3f6e52d-ca88-46ef-ad95-f84725276fd5
```

**Type of request**
Please let us know what verb you were using i.e. `POST`, `GET`, `DELETE` etc.

**Type of data being sent in the request**
Please provide an example of the data you were sending in as part of the original request.

**Content-Type**
Please provide the content type that you specified as part of the original request's headers.
i.e. `application/json` or `text/plain` etc.

**Features like SSVM_Fetch**
Please let us know what, if any, extra features you were trying to use i.e. remote data fetching 
```
curl --location --request POST 'https://rpc.ssvm.secondstate.io:8081/api/run/1/say' \
--header 'Content-Type: text/plain' \
--header 'SSVM_Fetch: https://raw.githubusercontent.com/tpmccallum/test_endpoint2/master/tim.txt' \
```

**Callback**
Please provide details about how you used a callback (in the header, in the body etc.). This info must also include an example of the data and the content type that the call back was processing i.e.
```
curl --location --request POST 'https://rpc.ssvm.secondstate.io:8081/api/run/1/say' \
--header 'Content-Type: text/plain' \
--header 'SSVM_Callback: { "hostname":"rpc.ssvm.secondstate.io","path": "/api/run/1/say", "method": "POST","port": 8081,"headers": {"Content-Type": "text/plain"}}' \
--data-raw 'world!'
```

**Multipart**
If you were using Multipart/form-data please provide an example of the keys and values that you were using i.e. 
```
curl --location --request POST 'https://dev.rpc.ssvm.secondstate.io:8081/api/multipart/run/49/say' \
--header 'Content-Type: multipart/form-data' \
--form 'first_input_example_1="one"' \
--form 'second_input_example_2="two"' \
--form 'fetch_third_input_example_3={"body": "body","hostname": "rpc.ssvm.secondstate.io","path": "/api/run/1/say","method": "POST","port": 8081,"headers": {"Content-Type": "text/plain"}}'
```

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Additional context**
Add any other context about the problem here.
