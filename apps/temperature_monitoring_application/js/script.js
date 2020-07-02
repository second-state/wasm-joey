class Sensor {
    constructor(_degreesC) {
        this.degreesC = _degreesC;
        this.key;
    }
    setDegreesC(_current_temperature) {
        this.degreesC = _current_temperature;
    }
    getDegreesC() {
        return this.degreesC;
    }
    setKey(_key) {
        this.key = _key;
    }
    getKey() {
        return this.key;
    }
}

function initializeDataStorage(_data) {
    return new Promise(function(resolve, reject) {
        var settings = {
            "url": "https://rpc.ssvm.secondstate.io:8081/api/ephemeral_storage",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": _data,
        };
        console.log(JSON.stringify(settings));
        jQuery.ajax(settings).done(function(response) {
            resolve(response);
        });
    });
}

function updateDataStorage(data, key) {
    return new Promise(function(resolve, reject) {
        var settings = {
            "url": "https://rpc.ssvm.secondstate.io:8081/api/ephemeral_storage/" + key,
            "method": "PUT",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({data}),
        };

        jQuery.ajax(settings).done(function(response) {
            resolve(response);
        });
    });
}

function calculateAverageTemp(data) {
    return new Promise(function(resolve, reject) {
        var settings = {
            "url": "https://rpc.ssvm.secondstate.io:8081/api/run/1/calculate_average_temperature",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": data,
        };

        jQuery.ajax(settings).done(function(response) {
            resolve(response);
        });
    });
}

function initializeSensors(sensors){

    initializeDataStorage(sensors["sensor1"].getDegreesC())
        .then(function(result) {
            console.log(JSON.stringify(JSON.parse(result).key));
            sensors["sensor1"].setKey(JSON.parse(result).key);
        })
        .catch(function() {
            console.log("Error");
        });

    initializeDataStorage(sensors["sensor2"].getDegreesC())
        .then(function(result) {
            console.log(JSON.stringify(JSON.parse(result).key));
            sensors["sensor2"].setKey(JSON.parse(result).key);
        })
        .catch(function() {
            console.log("Error");
        });

    initializeDataStorage(sensors["sensor3"].getDegreesC())
        .then(function(result) {
            console.log(JSON.stringify(JSON.parse(result).key));
            sensors["sensor3"].setKey(JSON.parse(result).key);
        })
        .catch(function() {
            console.log("Error");
        });

    initializeDataStorage(sensors["sensor4"].getDegreesC())
        .then(function(result) {
            console.log(JSON.stringify(JSON.parse(result).key));
            sensors["sensor4"].setKey(JSON.parse(result).key);
        })
        .catch(function() {
            console.log("Error");
        });

    initializeDataStorage(sensors["sensor5"].getDegreesC())
        .then(function(result) {
            console.log(JSON.stringify(JSON.parse(result).key));
            sensors["sensor5"].setKey(JSON.parse(result).key);
        })
        .catch(function() {
            console.log("Error");
        });
}

function startProcessing(sensors) {
    setInterval(function() {
        // Get sensor value
        var sensor_1_value = document.getElementById("temperature1").value;
        // Update value in memory
        sensors["sensor1"].setDegreesC(sensor_1_value);
        console.log(sensors["sensor1"].getDegreesC());
        updateDataStorage(JSON.parse(sensors["sensor1"].getDegreesC()), sensors["sensor1"].getKey())
            .then(function(result) {
                console.log(result);
            })
            .catch(function() {
                console.log("Error");
            });

        // Get sensor value
        var sensor_2_value = document.getElementById("temperature2").value;
        // Update value in memory
        sensors["sensor2"].setDegreesC(sensor_2_value);
        console.log(sensors["sensor2"].getDegreesC());
        updateDataStorage(JSON.parse(sensors["sensor2"].getDegreesC()), sensors["sensor2"].getKey())
            .then(function(result) {
                console.log(result);
            })
            .catch(function() {
                console.log("Error");
            });

        // Get sensor value
        var sensor_3_value = document.getElementById("temperature3").value;
        // Update value in memory
        sensors["sensor3"].setDegreesC(sensor_3_value);
        console.log(sensors["sensor3"].getDegreesC());
        updateDataStorage(JSON.parse(sensors["sensor3"].getDegreesC()), sensors["sensor3"].getKey())
            .then(function(result) {
                console.log(result);
            })
            .catch(function() {
                console.log("Error");
            });

        // Get sensor value
        var sensor_4_value = document.getElementById("temperature4").value;
        // Update value in memory
        sensors["sensor4"].setDegreesC(sensor_4_value);
        console.log(sensors["sensor4"].getDegreesC());
        updateDataStorage(JSON.parse(sensors["sensor4"].getDegreesC()), sensors["sensor4"].getKey())
            .then(function(result) {
                console.log(result);
            })
            .catch(function() {
                console.log("Error");
            });

        // Get sensor value
        var sensor_5_value = document.getElementById("temperature5").value;
        // Update value in memory
        sensors["sensor5"].setDegreesC(sensor_5_value);
        console.log(sensors["sensor5"].getDegreesC());
        updateDataStorage(JSON.parse(sensors["sensor5"].getDegreesC()), sensors["sensor5"].getKey())
            .then(function(result) {
                console.log(result);
            })
            .catch(function() {
                console.log("Error");
            });

    }, 500);
}
