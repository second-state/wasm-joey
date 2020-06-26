use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize)]
struct Temperatures {
    individual_temperatures: Vec<u64>
}

#[wasm_bindgen]
pub fn calculate_average_temperature(s: String) -> String {
    let temperatures: Temperatures = serde_json::from_str(&s).unwrap();
    let mut total: u64 = 0;
    let mut count: u64 = 0;
    for temp in temperatures.individual_temperatures {
        total = total + temp;
        count = count + 1;
    }
    let average: f64 = (total / count) as f64;
    let response_object = json!({ "celsius_temperature": average.round() });
    return serde_json::to_string(&response_object).unwrap();
}