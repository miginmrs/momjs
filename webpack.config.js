"use strict";

const path = require("path");
const webpack = require("webpack");

module.exports = env => {
  let filename = "rxrmi.umd.js";
  let mode = "development";
  if (env && env.production) {
    filename = "rxrmi.min.umd.js";
    mode = "production";
  }
  return {
    context: path.join(__dirname, "./"),
    entry: {
      index: "./source/index.ts"
    },
    externals: function rxjsExternals(context, request, callback) {
      if (request.match(/^rxjs(\/(?!internal)|$)/)) {
        var parts = request.split('/');
        if (parts.length > 2) {
          console.warn('webpack-rxjs-externals no longer supports v5-style deep imports like rxjs/operator/map etc. It only supports rxjs v6 pipeable imports via rxjs/operators or from the root.');
        }
        return callback(null, {
          root: parts,
          commonjs: request,
          commonjs2: request,
          amd: request
        });
      }
      callback();
    },
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
      library: "rxrmi",
      libraryTarget: "umd",
      path: path.resolve(__dirname, "./bundles")
    },
    resolve: {
      extensions: [".ts", ".js"]
    }
  };
};
