var https = require('follow-redirects').https;
var photon = require("@silvia-odwyer/photon-node");
var fs = require('fs');


function watermark_image() {
    return new Promise(function(resolve, reject) {



        var options = {
            'method': 'POST',
            'hostname': 'dev.rpc.ssvm.secondstate.io',
            'port': 8081,
            'path': '/api/multipart/run/276/watermark_single_image/bytes',
            'headers': {
                'Content-Type': 'multipart/form-data'
            },
            'maxRedirects': 20
        };

        var req = https.request(options, function(res) {
            var chunks = [];

            res.on("data", function(chunk) {
                chunks.push(chunk);
            });

            res.on("end", function(chunk) {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
            });

            res.on("error", function(error) {
                console.error(error);
            });
        });

        var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"image_width_1\"\r\n\r\n1024\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"image_height_2\"\r\n\r\n1024\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"fetch_image_pixels_3\"\r\n\r\nhttps://public-wasm-files.s3-ap-southeast-2.amazonaws.com/globe_image\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"watermark_width_4\"\r\n\r\n256\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"watermark_height_5\"\r\n\r\n256\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"fetch_watermark_pixels_6\"\r\n\r\nhttps://public-wasm-files.s3-ap-southeast-2.amazonaws.com/watermark_image\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"watermark_position_width_7\"\r\n\r\n10\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"watermark_position_height_8\"\r\n\r\n10\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";

        req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');

        req.write(postData);

        req.end();

    });
}

watermark_image().then((watermark_image_result) => {
    console.log(watermark_image_result.toString());
});

