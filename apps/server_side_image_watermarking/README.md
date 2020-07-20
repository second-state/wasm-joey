# Server-side image watermarking

The benefits of this watermarking service include:

- the watermarking can be commissioned by a client who does not have the images at hand (images can be fetched and stored remotely i.e. to and from S3)
- the watermarking can be performed on more than one image, in parallel (calls to this function are made via HTTP request via Joey)
- the watermarking can be performed on individual frames of a video (passed in either in parallel or in real time)
- the watermarking takes place on the server-side and takes advantage of high performance hardware
- the watermarking does not rely on third party dependencies (processes raw bytes)
- the processing of the raw bytes is performed exclusively by SSVM (stand alone stack-based WebAssembly (Wasm) Virtual Machine)

## Function Name
This Rust code has the following function name
```
watermark_single_image
```

## Function Parameters
This Rust code accepts the following parameters:
```
(_image_width: u32, _image_height: u32, mut _image_pixels: Vec<u8>, _watermark_width: u32, _watermark_height: u32, mut _watermark_pixels: Vec<u8>, _watermark_pos_width: u32, _watermark_pos_height: u32)
```
Explaination of the parametersis as follows:

**original image**

- _image_width, the pixel width of the image to be watermarked
- _image_height, the pixel height of the image to be watermarked
- _image_pixels, the image as a byte array

**watermark image**

- _watermark_width, the pixel width of the watermark image to be laid over the original
- _watermark_height, the pixel height of the watermark image to be laid over the original
- _watermark_pixels, the watermark as a byte array

**positioning information**

- _watermark_pos_width, the horizontal position of where the watermark should start to be overlaid i.e. pixel 1
- _watermark_pos_height, the vertical position of where the watermark should start to be overlaid i.e. pixel 1


If `_watermark_pos_width` is set to `1` and `_watermark_pos_height` is set to `1` then the watermark would be place in the top left corner like this.


![](images/watermarked.png)

Image attribution 
```
NASA/GSFC/Reto Stöckli, Nazmi El Saleous, and Marit Jentoft-Nilsen / Public domain
```

