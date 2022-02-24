// 'use strict';

const Video = Twilio.Video;
const { GaussianBlurBackgroundProcessor, VirtualBackgroundProcessor, isSupported } = Twilio.VideoProcessors;
const bootstrap = window.bootstrap;
 
const virtualBackgroundForm = document.querySelector('form#virtualBackground-Form');
const virtualBackgroundButton = document.querySelector('button#virtualBackground-Apply');
const videoInput = document.querySelector('video#video-input');
const removeProcessorButton = document.querySelector('button#remove-processor');
const errorMessage = document.querySelector('div.modal-body');
const errorModal = new bootstrap.Modal(document.querySelector('div#errorModal'));
const overlay = document.querySelector('div#overlay');

// Same directory as the current js file
const assetsPath = '';

var videoTrack;
let gaussianBlurProcessor;
let virtualBackgroundProcessor;

if (!isSupported) {
  errorMessage.textContent = 'This browser is not supported.';
  errorModal.show();
}


const loadImage = (name) =>
  new Promise((resolve) => {
    const image = new Image();
    image.src = `backgrounds/${name}.jpg`;
    image.onload = () => resolve(image);
  });

let images = {};

Promise.all([
  loadImage('back1'),
  loadImage('back2'),
  loadImage('back3'),
  loadImage('back4'),
  loadImage('back5'),
]).then(([back1, back2, back3, back4,back5]) => {

  images.back1 = back1;
  images.back2 = back2;
  images.back3 = back3;
  images.back4 = back4;
  images.back5 = back5;

  return images;
});

 
 function playvid() {
  videoTrack;
  Video.createLocalVideoTrack({
    width: 1280,
    height: 720,
    frameRate: 24,
    deviceId: document.querySelector('select#videoSource').value
  }).then((track) => {
    window.videoTrack = track;

    track.attach(videoInput);
    return videoTrack = track;
  });

}
// Adding processor to Video Track
const setProcessor = (processor, track) => {
  if (track.processor) {
    overlay.style.display = 'block';
    // removeProcessorButton.disabled = true;
    track.removeProcessor(track.processor);
  }
  if (processor) {
    removeProcessorButton.disabled = false;
    track.addProcessor(processor);
  }
};


virtualBackgroundButton.onclick = async event => {
  event.preventDefault();
  const options = {};
  const inputs = virtualBackgroundForm.elements;
  for (let item of inputs) {
    item.valueAsNumber
      ? (options[item.id] = item.valueAsNumber)
      : (options[item.id] = item.value);
  }
  let backgroundImage = images[options.backgroundImage];
  let { maskBlurRadius, fitType } = options;
  if (!virtualBackgroundProcessor) {
    virtualBackgroundProcessor = new VirtualBackgroundProcessor({
      assetsPath,
      maskBlurRadius,
      backgroundImage,
      fitType,
    });
    await virtualBackgroundProcessor.loadModel();

    overlay.style.display = 'block';
  } else {
    virtualBackgroundProcessor.backgroundImage = backgroundImage;
    virtualBackgroundProcessor.fitType = fitType;
    virtualBackgroundProcessor.maskBlurRadius = maskBlurRadius;
  }
  setProcessor(virtualBackgroundProcessor, videoTrack);
};

removeProcessorButton.disabled = true;
removeProcessorButton.onclick = event => {
  event.preventDefault();
  setProcessor(null, videoTrack);
};
 