const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");

const rootPath = path.resolve(__dirname, ".");

module.exports = () => {
  // replace process.env.*
  const env = dotenv.config().parsed;
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  return {
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      mainFields: ["main", "module", "browser"],
    },
    entry: path.resolve(rootPath, "src", "index.tsx"),
    target: "web",
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    },
    devServer: {
      contentBase: path.join(rootPath, "dist/renderer"),
      historyApiFallback: true,
      compress: true,
      hot: true,
      host: "0.0.0.0",
      port: 4000,
      publicPath: "/",
      https: true,
    },
    output: {
      path: path.resolve(rootPath, "dist/renderer"),
      filename: "js/[name].js",
      publicPath: "./",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new webpack.DefinePlugin(envKeys),
    ],
  };
};
