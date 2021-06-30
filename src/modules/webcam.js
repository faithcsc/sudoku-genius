const {webcamElement, webcamConfig} = require('./constants');

const loadWebcam = async () => tf.data.webcam(webcamElement, webcamConfig);

module.exports = {loadWebcam};
