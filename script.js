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

function correctDistortion() {
    if (!originalImage) return;  // 如果没有加载图片就返回

    let ctx = canvas.getContext('2d');
    ctx.putImageData(originalImage, 0, 0);  // 每次修正都用原始图片防止出现叠加效果
    let src = cv.imread(canvas);
    let dst = new cv.Mat();
    
    let sliderValue = document.getElementById('slider').value;
    let distortionStrength = (50 - sliderValue) / 50;  // 
    let k1 = distortionStrength * 0.5;  // 滑杆力量减少到50%, 100%貌似效果太强
    let k2 = distortionStrength * 0.5;  // 滑杆力量减少到50%
    let D = cv.matFromArray(1, 5, cv.CV_64F, [k1, k2, 0, 0, 0]);
    let f = (canvas.width + canvas.height) / 2;
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let K = cv.matFromArray(3, 3, cv.CV_64F, [f, 0, cx, 0, f, cy, 0, 0, 1]);

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