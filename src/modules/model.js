/* eslint-disable require-jsdoc */
const {
  BOARD_LEN,
  NUM_SUDOKU_CELLS,
  MNIST_LEN,
  MODEL_URL,
} = require("./constants");
const UI = require("./ui");

let MODEL = 0;

const load = async () => {
  if (MODEL === 0) {
    UI.addDebugInfo("Model loading");
    MODEL = await tf.loadLayersModel(MODEL_URL);
    UI.addDebugInfo("Model loaded");
  }
};

const testWithZeros = async () => {
  if (MODEL !== 0) {
    let predsZeros;
    predsZeros = doPrediction(
      tf.zeros([NUM_SUDOKU_CELLS, MNIST_LEN, MNIST_LEN, 1])
    );
    predsZeros = await predsZeros.dataSync();
    console.log("Zero predictions: " + predsZeros[0]);
  }
};

const doPrediction = (data) => {
  load();
  return MODEL.predictOnBatch(data).argMax(-1);
};

const predictSudokuGrid = async (data) => {
  let preds;
  preds = doPrediction(data);
  preds = await convertPredictions(preds);
  return preds;
};

const convertPredictions = async (preds) => {
  // Converts predictions from tf.Tensor format to array
  preds = await preds.data();
  const newPreds = [];
  for (let row = 0; row < BOARD_LEN; row += 1) {
    const emptyRow = [];
    for (let col = 0; col < BOARD_LEN; col += 1) {
      const thisCellValue = preds[row * BOARD_LEN + col] % 10;
      emptyRow.push(thisCellValue);
    }
    newPreds.push(emptyRow);
  }
  return newPreds;
};

module.exports = { load, testWithZeros, predictSudokuGrid };
