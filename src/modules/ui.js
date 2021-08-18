/* eslint-disable require-jsdoc */
const {
  webcamElement,
  toggleButton,
  resetButton,
  resultString,
  debugInfo,
  solutionTable,
  tables,
  MNIST_LEN,
  BOARD_LEN,
} = require("./constants");

let runMainLoop = true;
let isSolved = false;
let prevRunTime = Date.now();

// MODIFY HTML

const getRunMainLoop = () => runMainLoop;

const setRunMainLoop = (val) => (runMainLoop = val);

const getIsSolved = () => isSolved;

const setIsSolved = (val) => (isSolved = val);

const hideTables = () =>
  tables.forEach((table) => (table.style.display = "none"));

const showTables = () => tables.forEach((table) => (table.style.display = ""));

const firstLoadShow = () => {
  toggleButton.style.display = "";
  resetButton.style.display = "";
  webcamElement.style.display = "";
  hideTables();
};

const resumeFlow = () => {
  webcamElement.style.display = "";
  toggleButton.innerText = "⏸️ Pause solver";
  putResultString("Looking for a valid sudoku grid...");
};

const pauseFlow = () => {
  webcamElement.style.display = "none";
  toggleButton.innerText = "▶️ Resume solver";
  putResultString("Solver paused. Click resume to continue.");
};

const disablePauseButton = () => {
  toggleButton.style.backgroundColor = "gainsboro";
  toggleButton.style.color = "black";
  toggleButton.style.borderBottomColor = "#c2c2c2";
  toggleButton.disabled = true;
};

const resetPauseButton = () => {
  toggleButton.style.backgroundColor = "";
  toggleButton.style.color = "";
  toggleButton.style.borderBottomColor = "";
  toggleButton.disabled = false;
};

const putResultString = (newResultString) =>
  (resultString.innerHTML = newResultString);

const addDebugInfo = (addString) => {
  const currentTime = new Date();
  const timeElapsed = currentTime - prevRunTime;
  prevRunTime = Date.now();
  const debugString = `${currentTime.getHours()} ${currentTime.getMinutes()} ${currentTime.getSeconds()} ${currentTime.getMilliseconds()} (+${timeElapsed}) ${addString}`;
  console.log(debugString);
  debugInfo.innerHTML += `<br>${debugString}`;
};

const toggleDebug = () => {
  debug.style.display =
    debug.style.display === "block" ? hideDebug() : showDebug();
};

const hideDebug = () => {
  debug.style.display = "none";
  debugButton.innerText = "Show debug";
};
const showDebug = () => {
  debug.style.display = "block";
  debugButton.innerText = "Hide debug";
};

const foundSolution = () => {
  showTables();
  pauseFlow();
  disablePauseButton();
  putResultString("Solution found!<br>Looks wrong? Reset to try again.");
  runMainLoop = false;
  isSolved = true;
};

const hideOrDisplay = () => (runMainLoop ? resumeFlow() : pauseFlow());

const toggleOnOff = () => {
  runMainLoop = !runMainLoop;
  hideOrDisplay();
};

const resetSolutionTable = () => {
  for (let row = 0; row < BOARD_LEN; row += 1) {
    for (let col = 0; col < BOARD_LEN; col += 1) {
      solutionTable.rows[row].cells[col].innerHTML = "<span></span>";
    }
  }
};

const putSolutionTable = (puzzle, solution) => {
  const hasSolution = solution.length === 9;
  let newHTMLValue;
  for (let row = 0; row < BOARD_LEN; row += 1) {
    for (let col = 0; col < BOARD_LEN; col += 1) {
      // Model has inferenced this cell as 0
      if (puzzle[row][col] == 0) {
        newHTMLValue = `<span class="digitSolution">
                          ${solution[row][col]}
                        </span>`;
        if (!hasSolution) {
          newHTMLValue = `<span></span>`;
        }
      } else {
        newHTMLValue = `<span class="digitPuzzle">${puzzle[row][col]}</span>`;
      }
      solutionTable.rows[row].cells[col].innerHTML = newHTMLValue;
    }
  }
};

const showCroppedCells = async (croppedCells) => {
  let cell;
  const drawCellsArray = [];
  for (let row = 0; row < BOARD_LEN; row += 1) {
    for (let col = 0; col < BOARD_LEN; col += 1) {
      document.getElementById(`${row}${col}`).style.display = "";
      cell = croppedCells.slice(
        [row * BOARD_LEN + col, 0, 0, 0],
        [1, MNIST_LEN, MNIST_LEN, 1]
      );
      drawCellsArray.push(
        tf.browser.toPixels(
          tf.reshape(cell, [MNIST_LEN, MNIST_LEN]),
          document.getElementById(row + "" + col)
        )
      );
    }
  }
  await Promise.all(drawCellsArray);
};

// Hacky fix to fit webcam image to the main body.
webcamElement.style.width = "50rem";
webcamElement.style.height = "50rem";
toggleButton.addEventListener("click", toggleOnOff);

module.exports = {
  disablePauseButton,
  firstLoadShow,
  foundSolution,
  getIsSolved,
  getRunMainLoop,
  hideOrDisplay,
  hideTables,
  pauseFlow,
  putResultString,
  addDebugInfo,
  toggleDebug,
  showDebug,
  hideDebug,
  putSolutionTable,
  resetPauseButton,
  resetSolutionTable,
  resumeFlow,
  setIsSolved,
  setRunMainLoop,
  showCroppedCells,
  showTables,
  toggleOnOff,
};
