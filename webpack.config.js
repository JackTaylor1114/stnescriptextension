//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'webworker', //Run in Webworker context
  entry: './src/extension.ts', //Extension entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode' //Exclude vscode module because it is provied at runtime
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.ts', '.js'], //Support typescript and javascript files
    alias: {},
    fallback: {
      fs: false,
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};
module.exports = config;