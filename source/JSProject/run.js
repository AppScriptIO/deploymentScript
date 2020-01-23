import path from 'path'
import assert from 'assert'
import filesystem from 'fs'
import { watchFile, browserLivereload, ManageSubprocess } from '@deployment/nodejsLiveReload'
const { resolveAndLookupFile } = require('@dependency/handleFilesystemOperation')
const boltProtocolDriver = require('neo4j-driver').v1
import { memgraphContainer } from '@deployment/deploymentProvisioning'

async function clearGraphData() {
  console.groupCollapsed('• Run prerequisite containers:')
  memgraphContainer.runDockerContainer() // temporary solution
  console.groupEnd()
  // Delete all nodes in the in-memory database
  console.log('• Cleared graph database.')
  const url = { protocol: 'bolt', hostname: 'localhost', port: 7687 },
    authentication = { username: 'neo4j', password: 'test' }
  const graphDBDriver = boltProtocolDriver.driver(`${url.protocol}://${url.hostname}:${url.port}`, boltProtocolDriver.auth.basic(authentication.username, authentication.password))
  let session = await graphDBDriver.session()
  let result = await session.run(`match (n) detach delete n`)
  session.close()
}

function setInterval({ interval = 1000 } = {}) {
  // (function endlessProcess() { process.nextTick(endlessProcess) })() // Readable solution but it utilizes all available CPU. https://stackoverflow.com/questions/39082527/how-to-prevent-the-nodejs-event-loop-from-exiting
  console.log(`Executing interval in ${__filename}. NodeJS version: ${JSON.stringify(process.versions)}`)
  setInterval(() => console.info('Sleeping...'), interval)
}
const setTimeout = ({ timeout = 10000 } = {}) => setTimeout(() => console.log('setTimeout command ended. The process will exit now.'), timeout)

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
  let clientSideProjectConfigList = api.project.configuration.configuration?.clientSideProjectConfigList
  assert(clientSideProjectConfigList, `clientSideProjectConfigList must be configured in the project's configuration.`)

  let { restart: reloadBrowserClient } = await browserLivereload({
    targetProject: api.project /*adapter for working with target function interface.*/,
    rootServicePort: rootServiceConfig.port,
    rootServiceHost: targetServiceHost,
  })

  let manageSubprocess = new ManageSubprocess({ cliAdapterPath: path.join(api.project.configuration.rootPath, 'entrypoint/cli') })
  manageSubprocess.on('ready', () => reloadBrowserClient()) // reload browser after server reload

  // run application:
  await clearGraphData() // run prerequesite container and clear graph
  manageSubprocess.runInSubprocess()

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
    triggerCallback: async () => {
      await clearGraphData()
      manageSubprocess.runInSubprocess()
    },
    fileArray: [path.join(api.project.configuration.rootPath, 'source')],
    ignoreNodeModules: true,
    logMessage: true,
  })

  // File list to watch - Uses globs array for defining files patterns - https://github.com/isaacs/node-glob
  // TODO: use resolveAndLookupFile function
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

  const clientSidePathList = clientSideProjectConfigList.map(item => item.path)
  await watchFile({
    // to be run after file notification
    triggerCallback: () => reloadBrowserClient(), // reload browsers
    fileArray: [...clientSidePathList],
    ignoreNodeModules: true,
    logMessage: true,
  })
}
