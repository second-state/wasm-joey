# Temperature monitoring application

![](https://raw.githubusercontent.com/second-state/wasm-joey/master/images/temperature_monitoring_application_overview.png)

# Live demonstration
Please visit the [live demonstration](https://tpmccallum.github.io/temperature_sensor_demonstration/html/); change the temperature on the right hand side and watch the gauge respond in real time.

Step 1 - Sensor performs POST request to https://rpc.ssvm.secondstate.io:8081/api/ephemeral_storage (this happens 5 times because we have 5 sensors)

Step 2 - New unique key is returned from step 1 i.e. 42f7dba9-fef9-46ff-a788-9433f84386c4 (this happens 5 times because we have 5 sensors)

Step 3 - Sensor performs PUT request to https://rpc.ssvm.secondstate.io:8081/api/ephemeral_storage/42f7dba9-fef9-46ff-a788-9433f84386c4 to update sensors data (this happens once every 1/2 second)

Step 4 - Gauge performs POST request which results in server-side calculating average temp and also converting C to F. The single post is made by the gauge to https://rpc.ssvm.secondstate.io:8081/api/run/47/calculate_average_temperature which adds in a callback object to /api/run/46/convert_celsius_to_fahrenheit endpoint

Step 5 - Callback to the aforementioned https://rpc.ssvm.secondstate.io:8081/api/run/46/convert_celsius_to_fahrenheit executes

Step 6 - Gauge updates its Fahrenheit value with the single result that is returned



