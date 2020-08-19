"use strict";

const path = require("path");
const webpack = require("webpack");
const webpackRxjsExternals = require("webpack-rxjs-externals");

module.exports = env => {
  let filename = "index.umd.js";
  let mode = "development";
  if (env && env.production) {
    filename = "index.min.umd.js";
    mode = "production";
  }
  return {
    context: path.join(__dirname, "./"),
    entry: {
      index: "./source/index.ts"
    },
    externals: webpackRxjsExternals(),
    mode,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                declaration: false
              },
              configFile: "tsconfig-dist-webpack.json"
            }
          }
        }
      ]
    },
    output: {
      filename,
      library: "rxAsync",
      libraryTarget: "umd",
      path: path.resolve(__dirname, "./bundles")
    },
    resolve: {
      extensions: [".ts", ".js"]
    }
  };
};
