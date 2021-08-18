const BOARD_LEN = 9;
let currentPuzzle;

const solve = (board) => {
  currentPuzzle = board;
  solver(currentPuzzle);
  if (isValidSolution(currentPuzzle)) {
    return currentPuzzle;
  }
  return -1;
};

const solver = (data) => {
  let validDigit;
  for (let row = 0; row < BOARD_LEN; row += 1) {
    for (let col = 0; col < BOARD_LEN; col += 1) {
      if (data[row][col] == 0) {
        for (validDigit = 1; validDigit <= 9; validDigit++) {
          if (isValid(data, row, col, validDigit)) {
            data[row][col] = validDigit;
            if (solver(data)) {
              return true;
            }
            data[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const isValid = (board, row, col, k) => {
  for (let i = 0; i < BOARD_LEN; i += 1) {
    const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const n = 3 * Math.floor(col / 3) + (i % 3);
    if (board[row][i] == k || board[i][col] == k || board[m][n] == k) {
      return false;
    }
  }
  return true;
};

const isValidSolution = (board) => {
  const flattenedBoard = [].concat(...board);
  const countNonZero = flattenedBoard.filter((i) => i !== 0).length;
  if (countNonZero !== 81) {
    return false;
  }
  return isValidPuzzle(board);
};

const isValidPuzzle = (puzzle) => {
  const squareRowcolsRanges = [0, 3, 6];
  const isValidCellValue = (i) => i >= 0 && i <= 9;
  const sanityCheck = () => {
    const flattenedBoard = [].concat(...puzzle);
    const countNonZero = flattenedBoard.filter((i) => i !== 0).length;
    if (countNonZero < 17) {
      return null;
    }
    if (!(puzzle instanceof Array && puzzle.length === 9)) {
      return null;
    }
    for (let row = 0; row < BOARD_LEN; row += 1) {
      if (!(puzzle[row] instanceof Array && puzzle[row].length === BOARD_LEN)) {
        return null;
      }
      for (let col = 0; col < BOARD_LEN; col += 1) {
        if (!isValidCellValue(puzzle[row][col])) {
          return null;
        }
      }
    }
    return true;
  };

  const noRepeatsCheck = (numbers) => {
    const numbersSet = new Set(numbers);
    return numbers.length === Array.from(numbersSet).length;
  };

  const rowCheck = (row) => {
    const nonZeroInRow = row.filter((i) => i !== 0);
    return noRepeatsCheck(nonZeroInRow);
  };

  const colCheck = (col) => {
    const nonZeroInCol = col.filter((i) => i !== 0);
    return noRepeatsCheck(nonZeroInCol);
  };

  const squareCheck = (startRow, startCol) => {
    const nonZeroInSquare = [];
    for (let row = startRow; row < startRow + 3; row += 1) {
      for (let col = startCol; col < startCol + 3; col += 1) {
        if (puzzle[row][col] !== 0) {
          nonZeroInSquare.push(puzzle[row][col]);
        }
      }
    }
    return noRepeatsCheck(nonZeroInSquare);
  };

  if (!sanityCheck()) {
    return null;
  }
  for (let row = 0; row < BOARD_LEN; row += 1) {
    if (!rowCheck(puzzle[row])) {
      return false;
    }
  }
  for (let col = 0; col < BOARD_LEN; col += 1) {
    const currentColumn = [];
    for (let row = 0; row < BOARD_LEN; row += 1) {
      currentColumn.push(puzzle[row][col]);
    }
    if (!colCheck(currentColumn)) {
      return false;
    }
  }
  for (let i = 0; i < squareRowcolsRanges.length; i += 1) {
    for (let j = 0; j < squareRowcolsRanges.length; j += 1) {
      if (!squareCheck(squareRowcolsRanges[i], squareRowcolsRanges[j])) {
        return false;
      }
    }
  }
  return true;
};

module.exports = { solve, isValidPuzzle };
