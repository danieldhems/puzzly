module.exports = {
  entry: __dirname + "/client/scripts/main.ts",
  mode: "development",
  context: __dirname + "/client/scripts",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ["", ".ts", ".js"],
  },
};
