let video;
let invertedFrame;
let timeBuffer = []; // Buffer to hold previous frames for time delay
let delayFrames = 30; // Number of frames for the delay (adjustable)
let mic;
let fft;
let bufferSize = 1024; // Size of the audio buffer
let volumeLevel = 1; // Default volume level

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize video capture
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Create an inverted frame buffer
  invertedFrame = createImage(width, height);

  // Set up the microphone input
  mic = new p5.AudioIn();
  mic.start(); // Start capturing sound

  // Set up the FFT (Fast Fourier Transform) to visualize the sound
  fft = new p5.FFT();
  fft.setInput(mic);

  // Set the mic volume to an initial value (you can adjust this based on testing)
  mic.setGain(0.5);
}

function draw() {
  background(0);

  // Load the current video frame
  video.loadPixels();

  // Create the inverted frame
  createInvertedFrame();

  // Calculate the proportion of gray pixels in the current frame
  let grayProportion = calculateGrayProportion(video.pixels);

  // Add current frame to the buffer
  timeBuffer.push(invertedFrame.get());

  // Limit the buffer size to the desired delay
  if (timeBuffer.length > delayFrames) {
    timeBuffer.shift();
  }

  // Draw the original video flipped horizontally
  push();
  translate(width, 0); // Move the origin to the right edge
  scale(-1, 1); // Flip the x-axis
  image(video, 0, 0, width, height);
  pop();

  // Draw the delayed, inverted video flipped horizontally
  if (timeBuffer.length === delayFrames) {
    push();
    translate(width, 0); // Move the origin to the right edge
    scale(-1, 1); // Flip the x-axis
    tint(255, 127); // 50% transparency
    image(timeBuffer[0], 0, 0, width, height);
    pop();
  }

  // Process sound based on gray proportion
  processSound(grayProportion);
}

// Function to create an inverted video frame
function createInvertedFrame() {
  invertedFrame.loadPixels();
  for (let i = 0; i < video.pixels.length; i += 4) {
    invertedFrame.pixels[i] = 255 - video.pixels[i]; // Red
    invertedFrame.pixels[i + 1] = 255 - video.pixels[i + 1]; // Green
    invertedFrame.pixels[i + 2] = 255 - video.pixels[i + 2]; // Blue
    invertedFrame.pixels[i + 3] = 255; // Alpha (fully opaque)
  }
  invertedFrame.updatePixels();
}

// Function to calculate gray pixel proportion
function calculateGrayProportion(pixels) {
  let grayPixelCount = 0;
  let totalPixels = pixels.length / 4; // Each pixel has 4 values (R, G, B, A)

  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];

    // Check if the pixel is gray (R, G, B are close to each other)
    if (abs(r - g) < 15 && abs(g - b) < 15 && abs(r - b) < 15) {
      grayPixelCount++;
    }
  }

  return grayPixelCount / totalPixels;
}

// Function to process and adjust sound based on gray proportion
function processSound(grayProportion) {
  // Map gray proportion to volume (adjust these values as needed)
  let volume = map(grayProportion, 0, 1, 0.1, 0.5); // Volume range

  // Adjust the gain (volume) of the microphone input
  mic.setGain(volume);

  // Use FFT to analyze the sound
  let spectrum = fft.analyze();

  // Find the average frequency from the spectrum
  let averageFreq = fft.getCentroid(); // Frequency centroid is the "center of mass" of the frequency spectrum

  // Map gray proportion to frequency range (adjust these values as needed)
  let freq = map(grayProportion, 0, 1, 200, 800); // Frequency range

  // Output the processed sound: For simplicity, we'll visualize it as the audio spectrum
  noFill();
  stroke(255);
  beginShape();
  for (let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, 0, width);
    let y = map(spectrum[i], 0, 255, height, 0);
    vertex(x, y);
  }
  endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
