use std::collections::HashMap;
  
#[derive(Debug)]
struct Pixel {
    r: u8,
    g: u8,
    b: u8,
    t: u8,
}
#[wasm_bindgen]
pub fn watermark_single_image(_image_width: String, _image_height: String, mut _image_pixels: Vec<u8>, _watermark_width: String, _watermark_height: String, mut _watermark_pixels: Vec<u8>, _watermark_pos_width: String, _watermark_pos_height: String) -> Vec<u8> {
    // Convert the String inputs to u32 integers
    let image_width: u32 = _image_width.parse().unwrap();
    let image_height: u32 = _image_height.parse().unwrap();
    let watermark_width: u32 = _watermark_width.parse().unwrap();
    let watermark_height: u32 = _watermark_height.parse().unwrap();
    let watermark_pos_width: u32 = _watermark_pos_width.parse().unwrap();
    let watermark_pos_height: u32 = _watermark_pos_height.parse().unwrap();

    let mut pixels = HashMap::new();
    let mut width: u32 = watermark_width;
    let mut height: u32 = watermark_height;
    if watermark_pos_width + watermark_width > image_width {
        width = image_width - watermark_pos_width;
    }
    if watermark_pos_height + watermark_height > image_height {
        height = image_height - watermark_pos_height;
    }
    for w_h in 0..height{
        let height_start_pixel = (width * 4) * w_h;
        for w_w in 0..width{
            let width_start_pixel_at_byte = height_start_pixel + (w_w * 4);
            let temp_pixel = Pixel {r: _watermark_pixels[width_start_pixel_at_byte as usize], g:_watermark_pixels[width_start_pixel_at_byte as usize + 1], b:_watermark_pixels[width_start_pixel_at_byte as usize + 2], t:_watermark_pixels[width_start_pixel_at_byte as usize + 3]};
            let watermark_key = format!("{}{}{}", w_w.to_string(), "_".to_string(), w_h.to_string());
            pixels.insert(watermark_key, temp_pixel);
        }
    }
    let mut w_counter: u32 = 0;
    let mut h_counter: u32 = 0;
    let height_limit = watermark_pos_height + height;
    let width_limit = watermark_pos_width + width;
    for i_h in watermark_pos_height..height_limit {
        let height_start_pixel_2 = (image_width * 4) * i_h;
        for i_w in watermark_pos_width..width_limit {
            let width_start_pixel_at_byte_2 = height_start_pixel_2 + (i_w * 4);
            let image_key = format!("{}{}{}", w_counter.to_string(), "_".to_string(), h_counter.to_string());
            match pixels.get(&image_key) {
                Some(pixel) => {
                    _image_pixels[width_start_pixel_at_byte_2 as usize] = pixel.r;
                    _image_pixels[width_start_pixel_at_byte_2 as usize + 1] = pixel.g;
                    _image_pixels[width_start_pixel_at_byte_2 as usize + 2] = pixel.b;
                    _image_pixels[width_start_pixel_at_byte_2 as usize + 3] = pixel.t;
                },
                None => println!("Not found")
            }
            w_counter = w_counter + 1;
        }
        w_counter = 0;
        h_counter = h_counter + 1;
    }
    _image_pixels.clone()
}