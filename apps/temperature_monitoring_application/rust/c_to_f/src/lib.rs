use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize)]
struct Temperature {
    celsius_temperature: u64
}

#[wasm_bindgen]
pub fn convert_celsius_to_fahrenheit(s: String) -> String {
    let temperature: Temperature = serde_json::from_str(&s).unwrap();
    let fahrenheit: f64 = (temperature.celsius_temperature as f64 * 9 as f64 / 5 as f64) + 32 as f64;
    let response_object = json!({ "result": fahrenheit.round() });
    return serde_json::to_string(&response_object).unwrap();
}
