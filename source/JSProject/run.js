import path from 'path'
import assert from 'assert'
import filesystem from 'fs'
import EventEmitter from 'events'
import childProcess from 'child_process'
import { watchFile } from '@dependency/nodejsLiveReload'
import { browserLivereload } from '@dependency/nodejsLiveReload'

function setInterval({ interval = 1000 } = {}) {
  // (function endlessProcess() { process.nextTick(endlessProcess) })() // Readable solution but it utilizes all available CPU. https://stackoverflow.com/questions/39082527/how-to-prevent-the-nodejs-event-loop-from-exiting
  console.log(`Executing interval in ${__filename}. NodeJS version: ${JSON.stringify(process.versions)}`)
  setInterval(() => console.info('Sleeping...'), interval)
}
const setTimeout = ({ timeout = 10000 } = {}) => setTimeout(() => console.log('setTimeout command ended. The process will exit now.'), timeout)

class ManageSubprocess extends EventEmitter {
  subprocess // child subprocess
  cliAdapterPath // the path to the cli entrypoint file, that will receive arguments from the child process fork function and pass it to the programmatic module api.
  argumentList // cached arguments to be used for running subprocesses

  constructor({ cliAdapterPath }) {
    super()
    this.cliAdapterPath = cliAdapterPath
    // clean up if an error goes unhandled.
    process.on('exit', () => this.subprocess && this.subprocess.kill())
    process.on('SIGINT', () => console.log('Caught interrupt signal') && process.exit(0))
  }

  runInSubprocess() {
    if (this.subprocess) this.subprocess.kill()

    this.argumentList = arguments.length == 0 ? this.argumentList || [] : arguments

    let stringifyArgs = JSON.stringify(this.argumentList) // parametrs for module to be run in subprocess.
    // running in subprocess prevents allows to control the application and terminate it when needed.
    this.subprocess = childProcess
      .fork(this.cliAdapterPath, [stringifyArgs], {
        stdio: [0, 1, 2, 'ipc'],
        execArgv: [
          // '--inspect-brk=1272', // inspect subprocess with random port to prevent conflicts with the main process in case it's inspect flag was turned on.
          '--no-lazy', // for debugging purposes will load modules sequentially
        ],
      })
      .on('exit', () => console.log(`subprocess ${this.subprocess.pid} exited.`))
      .on('message', m => {
        console.log(m)
        this.emit('stateReady')
      })
      .on('close', code => {
        if (code === 8) console.error('Error detected, waiting for changes.')
      })

    return this.subprocess
  }
}

/*
  Run webapp project: 

  Takes into consideration: 
    - debugger
    - livereload

  Algorithm: 
    - watch files of different groups.
    - start webapp application server.
    - start browser proxy livereload server. 
    - register watch actions: affected groups result in reloading of server &/or browser.
*/
module.exports = async function({ api /* supplied by scriptManager */ } = {}) {
  let rootServiceConfig = api.project.configuration.configuration?.apiGateway?.service.find(item => item.subdomain == null /*Root service*/)
  assert(rootServiceConfig, `Root service must be configured in the projects apiGateway configuration.`)
  let targetServiceHost = api.project.configuration.configuration?.runtimeVariable?.HOST
  assert(targetServiceHost, `HOST runtime variable must be configured in the project's runtimeVariable configuration.`)

  let { restart: restartBrowser } = await browserLivereload({
    targetProject: api.project /*adapter for working with target function interface.*/,
    rootServicePort: rootServiceConfig.port,
    rootServiceHost: targetServiceHost,
  })

  // run application.
  let manageSubprocess = new ManageSubprocess({ cliAdapterPath: path.join(api.project.configuration.rootPath, 'entrypoint/cli') })
  manageSubprocess.runInSubprocess()
  manageSubprocess.on('stateReady', () => restartBrowser())

  // File list to watch - Uses globs array for defining files patterns - https://github.com/isaacs/node-glob
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

  await watchFile({
    // to be run after file notification
    triggerCallback: () => {
      manageSubprocess.runInSubprocess()
    },
    // TODO: make sure explicitly adding `./node_modules/` into the this array, will prevent it from being ignored.
    fileArray: [path.join(api.project.configuration.rootPath, 'source')] || watchFileList_serverSide,
    ignoreNodeModules: true,
    logMessage: true,
  })
}
