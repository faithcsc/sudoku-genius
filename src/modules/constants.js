/**
 * @jest-environment jsdom
 */

exports.developmentMode = false;
exports.mainBodyWidthInREM = 54; // 54 = 50 base + 2 * 2 padding
exports.baseFontSizeElement = document.querySelector("html");
exports.toggleButton = document.getElementById("toggle");
exports.resetButton = document.getElementById("reset");
exports.resultString = document.getElementById("resultString");
exports.solutionTable = document.getElementById("SudokuGridSolved");
exports.tables = document.querySelectorAll("table");
exports.debugTimings = document.querySelector("#debugTimings");
exports.webcamElement = document.getElementById("webcam");
exports.webcamConfig = {
  facingMode: "environment",
};
exports.WEBCAM_FRAME_LENGTH = exports.webcamElement.height;

exports.RESET_FRAMES = 10;

exports.MNIST_LEN = 28;
exports.BOARD_LEN = 9;
exports.BOARD_I = [...Array(exports.BOARD_LEN).keys()];

exports.NUM_SUDOKU_CELLS = exports.BOARD_LEN * exports.BOARD_LEN;

exports.doProfiling = true;
exports.DEFAULT_COUNTER_VALUE = 1;
exports.TOTAL_BOARD_HISTORY = 30;

// exports.MODEL_URL =
//   'https://s1.seedboxws.com/ddl/usr00037/mnist-alt/model.json';
exports.MODEL_URL = "../model/model.json";

exports.isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
exports.isiOSChrome = /crios/i.test(navigator.userAgent);
exports.isChrome = /chrome/i.test(navigator.userAgent) || isiOSChrome;
exports.isAndroid = /Android/i.test(navigator.userAgent);
exports.isMobile = exports.isAndroid || exports.isiOS || exports.isiOSChrome;
exports.height = window.innerHeight;
exports.width = window.innerWidth;
