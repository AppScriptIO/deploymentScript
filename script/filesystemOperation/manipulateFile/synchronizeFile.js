import path from 'path'
import util from 'util'
import stream from 'stream'
const pipeline = util.promisify(stream.pipeline);
import mkdirp from 'mkdirp'
import Rsync from 'rsync'
import size from 'gulp-size'
import plumber from 'gulp-plumber'
import { src as readFileAsObjectStream, dest as writeFileFromObjectStream } from 'vinyl-fs' 
import { reject } from 'any-promise';

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
export function recursivelySyncFile({ 
  source, // source folder
  destination, 
  copyContentOnly = false, // wether to copy the contents of the root source folder without the root folder  itself.
  extraOption = {}
} = {}) {

  // deal with trailing slash as it may change `rsync` behavior.
  destination = destination.replace(/\/$/, '') // remove trailing slash from `destination` as it has no effect (both cases are the same)
  if(copyContentOnly) source = (source.substr(-1) != '/') ? `${source}/` : source; // add trailing slash - as rsync will copy only contants when trailing slash is present.
  else source.replace(/\/$/, '') // remove trailing slash.

  let options = Object.assign({
    'a': true, // archive
    // 'v': true, // verbose
    'z': true, // compress
    'R': false, // relative - will create a nested path inside the destination using the full path of the source folder.
    'r': true // recursive
  }, extraOption)

  let rsync = new Rsync()
    .flags(options)
    // .exclude('+ */')
    // .include('/tmp/source/**/*')
    .source(source)
    .destination(destination)

  // Create directory.
  return new Promise(resolve => {
    mkdirp(destination, function(err) {     
      // Execute the command 
      rsync.execute(function(error, code, cmd) {
        if(error) reject(error)
        console.log(`• RSync ${source} to ${destination}`)
        resolve()
      }, function(data) {
        console.log(' ' + data)
      })
    })
  })
}

// implementation using streams.
export async function copyFileAndSymlink({ 
  source, // list of files or file matching patterns (globs)
  destination 
}) {
	// using `vinyl-fs` module to allow symlinks to be copied as symlinks and not follow down the tree of files.
  return await pipeline(
    readFileAsObjectStream(source, { followSymlinks: false }),
    // plumber(),
    writeFileFromObjectStream(destination, { overwrite: true }),
    size({ title: 'copyFileAndSymlink' })
  )
}
