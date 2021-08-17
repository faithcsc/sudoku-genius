# Sudoku Genius

[![Build Status](https://app.travis-ci.com/faithcsc/sudoku-genius.svg?branch=main)](https://app.travis-ci.com/faithcsc/sudoku-genius)

Automatically solves sudoku puzzles using your phone's browser and camera.

Try it out: https://sudoku-genius.herokuapp.com/

Made with [OpenCV.js](https://docs.opencv.org/master/d5/d10/tutorial_js_root.html) and [TensorFlow.js](https://www.tensorflow.org/js). All computation is done locally in the browser, no data is uploaded.

![Live Preview](demo/demo-v2.gif)

## Usage

NOTE: Does not work with Chrome/Firefox on iOS. iOS users, use Safari instead.

- Accept camera permissions.
- Point your camera directly at the puzzle.
- For best results, make sure the puzzle is
  - Straight on (not at an angle)
  - Printed
  - Has even lighting / not many shadows
- Once the solution is found, the solver will automatically stop.
- The original puzzle digits are black and the solution digits are red.
- If the solution cannot be found, resetting the solver usually helps.

## How it works

- OpenCV.js detects the sudoku grid.

- OpenCV.js and TensorFlow.js does image processing -- preprocesses the grid and individual cells so that it can be fed into the neural network.

- A TensorFlow.js neural network takes in each cell image and classifies it as 1-9 or 0/10 for an empty cell.

- Checks are done to see if the detected grid is a valid puzzle.

- If it is a valid puzzle, the brute force solver will solve the puzzle.

## Issues

If there are any problems, please first try with another OS or browser.

If the problem persists, open an issue with the following information:

- Browser
- OS
- A description of the error
- Steps to reproduce the error
- (Optional but preferred) A screen recording of the problem

## Contributing

## Next steps

- [ ] Write tests for image-based functions

- [x] ~~Write tests for non-image-based functions~~

- [x] ~~Reduce size of OpenCV.js using a custom build -- currently it is 10mb+~~

## Credit / Attributions

The site design is adapted from Wes Bos's JS30 course [Day 23 - Speech Synthesis](https://github.com/wesbos/JavaScript30/tree/master/23%20-%20Speech%20Synthesis).
