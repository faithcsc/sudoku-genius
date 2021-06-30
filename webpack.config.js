const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    './src/main.js',
    './src/modules/board.js',
    './src/modules/check.js',
    './src/modules/constants.js',
    './src/modules/imageprocessing.js',
    './src/modules/model.js',
    './src/modules/profiling.js',
    './src/modules/solver.js',
    './src/modules/ui.js',
    './src/modules/webcam.js',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',

  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /(\.css|\.html)/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
      {
        test: /(opencv|tfjs)\.js/,
        type: 'asset/source',
        generator: {
          filename: '[name][ext]',
        },
      },
      {
        test: /\.ico/,
        type: 'asset/source',
        generator: {
          filename: '[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: 'src/static', to: 'static'},
        {from: 'src/index.html', to: 'index.html'},
        {from: 'src/model', to: 'model'},
      ],
    }),
  ],
};
