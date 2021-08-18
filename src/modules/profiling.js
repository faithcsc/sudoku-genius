const { doProfiling, debugTimings, pageLoadTime } = require("./constants");

let startLoadPage;
let timeToLoadPage;
let startSolvePuzzle;
let timeToSolvePuzzle;

const loadPageStart = () => {
  startLoadPage = new Date().valueOf();
  if (doProfiling && window.console && window.console.profile) {
    console.log(`Start: Load page ${startLoadPage}`);
    console.profile(`Load page ${startLoadPage}`);
  }
};

const loadPageEnd = () => {
  timeToLoadPage = (Date.now() - parseFloat(pageLoadTime.innerText)) / 1000.0;
  console.log(`Load page time: ${timeToLoadPage}`);
  debugTimings.innerText += `Load: ${timeToLoadPage}s `;
  if (doProfiling && window.console && window.console.profile) {
    console.log(`Done: Load page ${startLoadPage}`);
    console.profileEnd(`Load page ${startLoadPage}`);
  }
};

const solvePuzzleStart = () => (startSolvePuzzle = Date.now());

const solvePuzzleEnd = () => {
  timeToSolvePuzzle = (Date.now() - startSolvePuzzle) / 1000.0;
  console.log(`Time to solve: ${timeToSolvePuzzle}`);
  debugTimings.innerHTML += `<br>Solve: ${timeToSolvePuzzle}s`;
  return timeToSolvePuzzle;
};

module.exports = {
  loadPageStart,
  loadPageEnd,
  solvePuzzleStart,
  solvePuzzleEnd,
};
