# Temperature monitoring application

![](images/average.png)

Step 1 - Sensor performs POST request to https://rpc.ssvm.secondstate.io:8081/api/ephemeral_storage (this happens 5 times because we have 5 sensors)

Step 2 - New unique key is returned from step 1 i.e. 42f7dba9-fef9-46ff-a788-9433f84386c4 (this happens 5 times because we have 5 sensors)

Step 3 - Sensor performs PUT request to https://rpc.ssvm.secondstate.io:8081/api/ephemeral_storage/42f7dba9-fef9-46ff-a788-9433f84386c4 (this happens every 1000ms)

Step 4 - Gauge performs POST request to https://rpc.ssvm.secondstate.io:8081/api/run/47/calculate_average_temperature and adds in a callback object to /api/run/46/convert_celsius_to_fahrenheit endpoint

Step 5 - Raspberry Crunch performs callback as a POST to the aforementioned https://rpc.ssvm.secondstate.io:8081/api/run/46/convert_celsius_to_fahrenheit

Step 6 - Gauge updates its Fahrenheit value with the single result that is returned


