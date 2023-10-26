let originalImage = null;
let canvas = document.getElementById('canvas');

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}

function loadImage() {
    let inputImage = document.getElementById('inputImage');
    let img = new Image();
    img.src = URL.createObjectURL(inputImage.files[0]);
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        originalImage = ctx.getImageData(0, 0, img.width, img.height);
        correctDistortion();  // 根据滑杆位置确定初始画面正确
    };
}

function updateFocalLengthValue() {
    let focalLengthSlider = document.getElementById('focalLengthSlider');
    let focalLengthValue = document.getElementById('focalLengthValue');
    focalLengthValue.textContent = focalLengthSlider.value + 'mm';
}



function convertFocalLengthToPixels(f_mm, sensorSize_mm, imageSize_pixels) {
    return (f_mm / sensorSize_mm) * imageSize_pixels;
}

function correctDistortion() {
    if (!originalImage) return;  // 如果没有加载图片就返回

    let ctx = canvas.getContext('2d');
    ctx.putImageData(originalImage, 0, 0);  // 每次修正都用原始图片防止出现叠加效果
    let src = cv.imread(canvas);
    let dst = new cv.Mat();
    
    let sliderValue = document.getElementById('slider').value;
    let distortionStrength = (50 - sliderValue) / 50;  // 
    let k1 = distortionStrength * 1.4;  // 滑杆力量可调系数, 暂定1.4
    let k2 = distortionStrength * 1.4;  
    let D = cv.matFromArray(1, 5, cv.CV_64F, [k1, k2, 0, 0, 0]);
    // 如果拿不到真实的镜头焦距, 那就只能按图的大小瞎算一个
    // let f_pixels = (canvas.width + canvas.height) / 2;
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let focalLengthSlider = document.getElementById('focalLengthSlider');
    let f_mm = parseFloat(focalLengthSlider.value);
    let sensorWidth_mm = 36;
    let f_pixels = convertFocalLengthToPixels(f_mm, sensorWidth_mm, canvas.width);
    let K = cv.matFromArray(3, 3, cv.CV_64F, [f_pixels, 0, cx, 0, f_pixels, cy, 0, 0, 1]);


    cv.undistort(src, dst, K, D);
    cv.imshow(canvas, dst);

    src.delete();
    dst.delete();
    D.delete();
    K.delete();
}

function saveImage() {
    let canvas = document.getElementById('canvas');
    let link = document.createElement('a');
    link.download = 'corrected-image.png';
    link.href = canvas.toDataURL();
    link.click();
}