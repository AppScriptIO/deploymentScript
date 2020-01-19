import path from 'path'
import filesystem from 'fs'
import { execSync, spawn, spawnSync } from 'child_process'
import { browserLivereload } from '@dependency/nodejsLiveReload'
function setInterval({ interval = 1000 } = {}) {
  // (function endlessProcess() { process.nextTick(endlessProcess) })() // Readable solution but it utilizes all available CPU. https://stackoverflow.com/questions/39082527/how-to-prevent-the-nodejs-event-loop-from-exiting
  console.log(`Executing interval in ${__filename}. NodeJS version: ${JSON.stringify(process.versions)}`)
  setInterval(() => console.info('Sleeping...'), interval)
}
const setTimeout = ({ timeout = 10000 } = {}) => setTimeout(() => console.log('setTimeout command ended. The process will exit now.'), timeout)

/*
  Takes into consideration: 
    - debugger
    - livereload
*/
module.exports = function(...args) {
  const { api /* supplied by scriptManager */ } = args[0]
  args[0].targetProject = api.project // adapter for working with target function interface.

  const watchFileList_clientSide = [
    // TODO: there is an issue when specifying multiple paths, for some reason it doesn't watch all files when separately configured, while watching all files without distinction is possible. Maybe an issue with glob strings
    // not working when separated.
    // '/project/application/source/clientSide/**/*.css',
    // '/project/application/source/clientSide/**/*.html',
    // '/project/application/source/clientSide/**/*.js',

    // the following works.
    '/project/application/source/clientSide/**/*',
    '!/project/application/source/clientSide/**/node_modules/**/*',
    '!/project/application/source/clientSide/**/component.package/**/*',
    '!/project/application/source/clientSide/**/js.package.yarn/**/*',
  ] // equals to '!/project/application/source/{node_modules,node_modules/**/*}'

  const watchFileList_serverSide = [
    '/project/application/source/serverSide/**/*.js',
    // '/project/application/source/serverSide/**/*.css',
    // '/project/application/source/serverSide/**/*.html',
    // '/project/application/source/serverSide/node_modules/appscript{/**/*.js,!/node_modules/**/*}',
    '!/project/application/source/serverSide/node_modules{,/**/*,!/appscript/**/*}',
    // '!/project/application/source/serverSide/node_modules/appscript/node_modules{,/**/*}',
  ] // equals to '!/app/{node_modules,node_modules/**/*}'

  browserLivereload(...args)
}
