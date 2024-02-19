const gulp = require("gulp");
const webpack = require("webpack-stream");
const clean = require("gulp-clean");
const path = require("path");
var ts = require("gulp-typescript");

var clientDir = "client/";
var distDir = "dist/";

gulp.task("default", ["copy", "webpack", "watch"]);

gulp.task("copy", [], function () {
  gulp.src(path.join(clientDir, "*.{html,png,jpg}")).pipe(gulp.dest(distDir));
});

gulp.task("clean", function () {
  gulp.src(distDir, { read: false }).pipe(clean());
});

gulp.task("webpack", function () {
  gulp
    .src(path.join(clientDir, "main.js"))
    .pipe(
      ts({
        noImplicitAny: true,
        outFile: "output.js",
      })
    )
    .pipe(webpack(require("./webpack.config.js")))
    .pipe(gulp.dest(distDir));
});

gulp.task("watch", [], function () {
  gulp.watch(path.join(clientDir, "**/*.js"), ["webpack"]);
  gulp.watch(path.join(clientDir, "index.html"), ["copy"]);
});
