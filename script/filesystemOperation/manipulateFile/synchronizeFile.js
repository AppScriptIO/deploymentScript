"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recursivelySyncFile = recursivelySyncFile;
exports.copyFileAndSymlink = copyFileAndSymlink;

var _util = _interopRequireDefault(require("util"));

var _stream = _interopRequireDefault(require("stream"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _rsync = _interopRequireDefault(require("rsync"));

var _gulpSize = _interopRequireDefault(require("gulp-size"));

var _vinylFs = require("vinyl-fs");

var _anyPromise = require("any-promise");

const pipeline = _util.default.promisify(_stream.default.pipeline);

/*
import rsyncObjectStream from 'gulp-rsync'
import gulp from 'gulp'
// using gulp-rsync
function gulpRsync(baseSource, source, destination) {
  return gulp.src(source)
    .pipe(rsyncObjectStream({
      // paths outside of root cannot be specified.
      root: baseSource,
      destination: destination,
      incremental: true,
      compress: true,
      // recursive: true,
      // clean: true, // --delete - deletes files on target. Files which are not present on source.
      // dryrun: true, // for tests use dryrun which will not change files only mimic the run.
      // progress: true,
      // skip files which are newer on target/reciever path.
      update: true
      // args this way doesn't work ! should use the equevalent options in API
      // args: ['--verbose', '--compress', '--update', '--dry-run']
      // DOESN'T WORK FOR MULTIPLE PATHS - error "outside of root" When relatice is off rsync can recieve multiple paths through gulp.src.
      // relative: false
    }))
}
*/
// implementation using `rsync` module directly
function recursivelySyncFile({
  source,
  // source folder
  destination,
  copyContentOnly = false,
  // wether to copy the contents of the root source folder without the root folder  itself.
  extraOption = {}
} = {}) {
  // deal with trailing slash as it may change `rsync` behavior.
  destination = destination.replace(/\/$/, ''); // remove trailing slash from `destination` as it has no effect (both cases are the same)

  if (copyContentOnly) source = source.substr(-1) != '/' ? `${source}/` : source; // add trailing slash - as rsync will copy only contants when trailing slash is present.
  else source.replace(/\/$/, ''); // remove trailing slash.

  let options = Object.assign({
    'a': true,
    // archive
    // 'v': true, // verbose
    'z': true,
    // compress
    'R': false,
    // relative - will create a nested path inside the destination using the full path of the source folder.
    'r': true // recursive

  }, extraOption);
  let rsync = new _rsync.default().flags(options) // .exclude('+ */')
  // .include('/tmp/source/**/*')
  .source(source).destination(destination); // Create directory.

  return new Promise(resolve => {
    (0, _mkdirp.default)(destination, function (err) {
      // Execute the command 
      rsync.execute(function (error, code, cmd) {
        if (error) (0, _anyPromise.reject)(error);
        console.log(`• RSync ${source} to ${destination}`);
        resolve();
      }, function (data) {
        console.log(' ' + data);
      });
    });
  });
} // implementation using streams.


async function copyFileAndSymlink({
  source,
  // list of files or file matching patterns (globs)
  destination
}) {
  // using `vinyl-fs` module to allow symlinks to be copied as symlinks and not follow down the tree of files.
  return await pipeline((0, _vinylFs.src)(source, {
    followSymlinks: false
  }), // plumber(),
  (0, _vinylFs.dest)(destination, {
    overwrite: true
  }), (0, _gulpSize.default)({
    title: 'copyFileAndSymlink'
  }));
}