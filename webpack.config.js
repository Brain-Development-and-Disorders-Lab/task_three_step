const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    threestep: "./src/lib/Main.ts",
  },
  devtool: "inline-source-map",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Three-Step Game",
    }),
  ],
  devServer: {
    contentBase: [
      // Output path
      path.join(__dirname, "./built"),
      // Assets path
      path.join(__dirname, "./src/img"),
    ],
    // Required public path for assets
    contentBasePublicPath: "/img",
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      crypto: false,
      os: false,
      assert: require.resolve("assert"),
      path: require.resolve("path-browserify"),
    },
  },
  output: {
    path: path.resolve(__dirname, "built/"),
    filename: "[name].bundle.js",
    clean: true,
  },
};
