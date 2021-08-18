/* jshint esversion: 8 */
const {
  webcamElement,
  webcamConfig,
  resetButton,
  debugTimings,
  RESET_FRAMES,
  DEFAULT_COUNTER_VALUE,
} = require("./modules/constants");
const profiling = require("./modules/profiling");
const imageprocessing = require("./modules/imageprocessing");
const model = require("./modules/model");
const board = require("./modules/board");
const { solve, isValidPuzzle } = require("./modules/solver");
const UI = require("./modules/ui");
const check = require("./modules/check");

/**
 * Resets the solver.
 */
export const reset = () => {
  UI.putResultString("Resetting...");
  if (UI.getIsSolved()) {
    profiling.solvePuzzleStart();
    totalCounter = DEFAULT_COUNTER_VALUE;
  }
  counter = DEFAULT_COUNTER_VALUE;
  commonBoardValid = false;
  recentBoardValid = false;
  board.reset();
  UI.setRunMainLoop(true);
  UI.setIsSolved(false);
  UI.resetSolutionTable();
  UI.resetPauseButton();
  UI.hideTables();
  UI.resumeFlow();
};

// MAIN

/**
 * Loads the webcam, runs the solver
 */
async function main() {
  let image;
  let sudokuGridImages;
  let solution;
  let puzzleOriginal;
  let recentBoard;
  let commonBoard;
  let webcam;

  console.dir(check);
  UI.addDebugInfo("Load page start");
  profiling.loadPageStart();
  UI.addDebugInfo("Check HTTPS");
  check.checkHTTPS();
  UI.addDebugInfo("Change layout if mobile");
  check.changeLayoutIfMobile();

  if (check.isiOSChrome) {
    const errorMessage = check.getUserInstruction();
    UI.putResultString(errorMessage);
    UI.hideDebug();
    return;
  }

  // Webcam
  try {
    UI.addDebugInfo("Checking webcam");
    webcam = await tf.data.webcam(webcamElement, webcamConfig);
    UI.addDebugInfo("firstLoadShow");
    UI.firstLoadShow();
  } catch (error) {
    let errorMessage;
    errorMessage = check.getErrorMessage();
    errorMessage += `<br>Error: ${error}</span>`;
    UI.putResultString(errorMessage);
    return;
  }

  UI.addDebugInfo("Loading model");
  await model.load();

  UI.addDebugInfo("Testing with zeros");
  await model.testWithZeros();

  UI.addDebugInfo("Reset");
  reset();
  UI.addDebugInfo("Hide or display");
  UI.hideOrDisplay();

  UI.addDebugInfo("loadPageEnd");
  profiling.loadPageEnd();
  UI.addDebugInfo("solvePuzzleStart");
  profiling.solvePuzzleStart();

  while (true) {
    tf.engine().startScope();
    if (UI.getRunMainLoop()) {
      image = await webcam.capture();
      image = await imageprocessing.getBiggestRectangle(image);
      if (image !== null) {
        sudokuGridImages = await imageprocessing.cropCells(image);

        recentBoard = await model.predictSudokuGrid(sudokuGridImages);
        board.updateHistory(recentBoard);
        commonBoard = board.getMostCommon();
        recentBoardValid = isValidPuzzle(recentBoard);
        commonBoardValid = isValidPuzzle(commonBoard);
        console.log(`commonBoard: ${commonBoardValid}`);
        console.log(`recentBoard: ${commonBoardValid}`);
        console.log(`debugTimings: ${debugTimings.innerHTML}`);

        if (commonBoardValid || recentBoardValid) {
          solution = recentBoardValid ? recentBoard : commonBoard;
          puzzleOriginal = JSON.parse(JSON.stringify(solution));
          solution = solve(solution);
          if (solution !== -1) {
            await UI.showCroppedCells(sudokuGridImages);
            UI.putSolutionTable(puzzleOriginal, solution);
            UI.foundSolution();
            const timeToSolvePuzzle = profiling.solvePuzzleEnd();

            debugTimings.innerHTML += ` Frames: ${totalCounter}`;
            debugTimings.innerHTML += ` Per: ${(
              timeToSolvePuzzle / totalCounter
            ).toFixed(3)} s`;
          }
        }

        await tf.nextFrame();
      }

      counter += 1;
      totalCounter += 1;

      // Reset state every 20 frames if no solution is found.
      // Stop from being stuck
      if (!UI.getIsSolved() && counter >= RESET_FRAMES) {
        console.log(
          `No solution found in ${RESET_FRAMES} frames - resetting state`
        );
        reset();
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    tf.engine().endScope();
  }
}

let webcam;
let commonBoardValid;
let recentBoardValid;
let counter;
let totalCounter = DEFAULT_COUNTER_VALUE;

resetButton.addEventListener("click", reset);

main();
