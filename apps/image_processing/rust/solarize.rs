use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[no_mangle]
pub fn solarize(mut v: Vec<u8>) -> Vec<u8> {
    for item in v.iter_mut() {
        if 200 as u8 - *item as u8 > 0 {
            *item = 200 - *item;
        }
    }
    let r = v.clone();
    r
}