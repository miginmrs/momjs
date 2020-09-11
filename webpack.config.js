"use strict";

const path = require("path");
const webpack = require("webpack");

module.exports = env => {
  let filenamebase = "rxrmi", devtool = { devtool: "source-map" };
  let mode = "development", full = false;
  if (env && env.full) {
    filenamebase += ".deps";
    full = true;
  }
  if (env && env.production) {
    filenamebase += ".min";
    mode = "production";
    devtool = {};
  }
  const filename = filenamebase + '.umd.js';
  return {
    ...devtool,
    context: path.join(__dirname, "./"),
    entry: {
      index: "./source/index.ts"
    },
    externals: function (context, request, callback) {
      const external = (root = request.split('/')) => callback(null, {
        root,
        commonjs: request,
        commonjs2: request,
        amd: request
      });
      if (!full && request.match(/^(altern-map|dependent-type|rx-async)$/)) return external();
      if (request.match(/^rxjs(\/(operators|testing|ajax|webSocket|fetch|config|internal\/.*|)|)$/)) return external();
      callback();
    },
    mode,
    module: {
      rules: [{
        test: /\.ts$/,
        exclude: [/deep-is\.d\.ts/],
        use: {
          loader: "ts-loader",
          options: {
            compilerOptions: { declaration: false },
            configFile: "tsconfig-dist-webpack.json"
          }
        }
      }, {
        test: /deep-is\.d\.ts$/,
        use: "ignore-loader"
      }]
    },
    output: {
      filename,
      library: "rxrmi",
      libraryTarget: "umd",
      path: path.resolve(__dirname, "./bundles"),
      globalObject: 'self',
    },
    resolve: {
      extensions: [".ts", ".js"],
      mainFields: ['source', 'browser', 'module', 'main'],
    }
  };
};
