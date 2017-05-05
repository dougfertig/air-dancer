// fork getUserMedia for multiple browser versions, for those
// that need prefixes
// https://mdn.github.io/voice-change-o-matic/


navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var voiceSelect = document.getElementById("voice");
var source;
var stream;

window.INTENSITY = 0;
window.THRESHOLD = 5000;

// grab the mute button to use below

var mute = document.querySelector('.mute');

//set up the different audio nodes we will use for the app

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

var distortion = audioCtx.createWaveShaper();
var gainNode = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();

//main block for doing the audio recording

if (navigator.getUserMedia) {
   console.log('getUserMedia supported.');
   navigator.getUserMedia (
      // constraints - only audio needed for this app
      {
         audio: true
      },

      // Success callback
      function(stream) {
         source = audioCtx.createMediaStreamSource(stream);
         source.connect(analyser);
         analyser.connect(distortion);
         distortion.connect(biquadFilter);
         biquadFilter.connect(convolver);
         convolver.connect(gainNode);
         gainNode.connect(audioCtx.destination);

      	 visualize();

      },

      // Error callback
      function(err) {
         console.log('The following gUM error occured: ' + err);
      }
   );
} else {
   console.log('getUserMedia not supported on your browser!');
}



function visualize() {
    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    INTENSITY = 0;
    var dataArray = new Uint8Array(bufferLength);

      analyser.getByteFrequencyData(dataArray);
      for(var i = 0; i < bufferLength; i++) {
        INTENSITY += dataArray[i];
      }
      // TESTING VOICE INTENSITY
      // console.log(INTENSITY, TOGGLE);

      if(INTENSITY > THRESHOLD) {
        TOGGLE = true;
      }
      else {
        TOGGLE = false;
      }
}

setInterval(visualize, 10);

