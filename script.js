const temocImage = document.querySelector('.temoc-image');
const temocFrames = ['assets/temoc1.png', 'assets/temoc2.png'];
let temocFrameIndex = 0;

setInterval(() => {
	temocFrameIndex = (temocFrameIndex + 1) % temocFrames.length;
	temocImage.src = temocFrames[temocFrameIndex];
}, 500);
