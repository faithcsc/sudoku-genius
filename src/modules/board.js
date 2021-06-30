const {TOTAL_BOARD_HISTORY, BOARD_LEN} = require('./constants');

let BOARD_STATE_HISTORY; let BOARD_INDEX;

const updateHistory = (newBoard) => {
  if (newBoard.length == BOARD_LEN && newBoard[0].length == BOARD_LEN) {
    BOARD_STATE_HISTORY[BOARD_INDEX] = newBoard;
    BOARD_INDEX += 1;
    BOARD_INDEX = BOARD_INDEX % TOTAL_BOARD_HISTORY;
    console.log(`Board index: ${BOARD_INDEX}`);
  } else {
    console.log(
        `newBoard has wrong size:`,
        `${newBoard.length},${newBoard[0].length}`,
    );
  }
};

const getMode = (array) => {
  if (array.length == 0) {
    return null;
  }

  const modeMap = array.reduce((mode, item) => {
    if (!mode[item]) mode[item] = 0;
    mode[item]++;
    return mode;
  }, {});

  const mostCommon = Object
      .keys(modeMap)
      .reduce((a, b) => modeMap[a] > modeMap[b] ? a : b);

  return mostCommon;
};

const getMostCommon = () => {
  if (BOARD_STATE_HISTORY.length == 0) {
    return;
  }
  // Return the most common cell number in the history of sudoku grids
  const condensedBoard = [];
  for (let row = 0; row < BOARD_LEN; row += 1) {
    const currentRow = [];
    for (let col = 0; col < BOARD_LEN; col += 1) {
      const cellHistory = BOARD_STATE_HISTORY.map((x) => x[row][col]);
      currentRow.push(getMode(cellHistory));
    }
    condensedBoard.push(currentRow);
  }
  return condensedBoard;
};

const reset = () => {
  BOARD_STATE_HISTORY = [];
  BOARD_INDEX = 0;
};

module.exports = {reset, getMostCommon, updateHistory};
