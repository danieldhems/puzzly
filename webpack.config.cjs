const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: __dirname + "/client/scripts/main",
  mode: "development",
  context: __dirname + "/client/scripts",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader", // 'babel-loader' is also a legal name to reference
          options: {
            presets: [["babel-preset-es2015", { targets: "defaults" }]],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: __dirname + "/client/lib/**.js", to: __dirname + "/dist/lib" },
      ],
    }),
  ],
  resolve: {
    extensions: ["", ".ts", ".js"],
  },
};
