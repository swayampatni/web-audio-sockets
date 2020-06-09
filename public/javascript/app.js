var socket = io();

// Configurable variables
var initialQuantity = 100, // % filled of the bottle
    fps = 24,             // Smoothness of the draining animation
    volUpRange = 125,     // Volume upper range
    volDnRange = 90;      // Volume lower range

var quantity = initialQuantity;

//  nowDrinking is a flag for checking if the drinking function is running
var nowDrinking = true,
    drinkTimer;

var meter = null;

//run mobile functions
if ( isMobile.any ){
    webRTCCheck();
    initAudio();
}

function initAudio(){
  //grab the audio via RTC
  if( navigator.getUserMedia ){
    navigator.getUserMedia ({ audio: true, video: false }, getAudio, function(){} );
  }
}

function webRTCCheck(){
    //Check if getUserMedia, requestAnimationFrame, and AudioContext are supported by browser
    window.requestAnimFrame = ( function(){ return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame; })();
    navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
}

function getAudio(stream){
    //create object for accessing audio
    var audioContext = new AudioContext();
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);
    audioInputUpdate();
}

function audioInputUpdate(){
//Loop for new audio input
  var volume = Math.floor(meter.volume*1000);
  socket.emit('audio-update', volume);
  requestAnimFrame(audioInputUpdate);
}

function drinking () {
//  This function controls draining the bottle.
  var liquid = document.getElementById('liquid'),
      gulp;
  nowDrinking = true;
  (function drain () {
    drinkTimer = window.setTimeout(function () {
      if (quantity > 0) {
        window.requestAnimationFrame(drain);
      } else {
        socket.emit('stopped');
      }
      gulp = quantity % 5 === 0;
      if (gulp) {
        liquid.style.height = quantity + '%';
      }
      quantity--;
    }, 1500 / fps);
  })();
}

socket.on('audio-new-value', function (volume) {
//  Update volume display (can remove this for demo)
  var volumeAmount = document.getElementById('volume-amount');
  volumeAmount.innerHTML = volume;
//  Reset quantity if at 0, then run drinking function
  if (volume >= volUpRange && nowDrinking === false) {
    if (quantity <= 0) {
      /*quantity = initialQuantity;*/
    }
    drinking();
//  Stop drinking function
  } else if (volume <= volDnRange && nowDrinking) {
    window.clearTimeout(drinkTimer);
    nowDrinking = false;
  }
});

// socket.on('on-stop', function () {
// //  Do something(?) when the draining finishes
// });
