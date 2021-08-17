const {
  isiOS,
  isiOSChrome,
  isChrome,
  isAndroid,
  isMobile,
  height,
  width,
  mainBodyWidthInREM,
  baseFontSizeElement,
} = require("./constants");
const UI = require("./ui");

const getErrorMessage = () => {
  const userInstruction = getUserInstruction();
  const debugString = getDebugString();
  return `${userInstruction}<br><span class="codeText">${debugString}<br>`;
};

const getUserInstruction = () => {
  if (isiOSChrome) {
    return "Open this page in Safari.<br>";
  }
  return "Refresh page and allow camera access.<br>";
};

const getDebugString = (error) => `UserAgent: ${navigator.userAgent}<br>\
isiOS: ${isiOS}<br>\
isiOSChrome: ${isiOSChrome}<br>\
isChrome: ${isChrome}<br>\
isAndroid: ${isAndroid}<br>\
isMobile: ${isMobile}<br>\
height: ${height}<br>\
width: ${width}<br>`;

UI.addResultString(`${getDebugString("")}`);

const checkHTTPS = () => {
  // Make sure webpage is https:// to allow webcam access
  if (
    location.protocol !== "https:" &&
    location.hostname.indexOf("faithchia.me") !== -1
  ) {
    location.replace(
      `https:${location.href.substring(location.protocol.length)}`
    );
  }
};

const changeLayoutIfMobile = () => {
  if (isMobile) {
    const scale = window.innerWidth / mainBodyWidthInREM;
    baseFontSizeElement.style.fontSize = `${scale}px`;
  }
};

module.exports = { getErrorMessage, checkHTTPS, changeLayoutIfMobile };
