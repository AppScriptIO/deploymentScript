import path from 'path'
import assert from 'assert'
import filesystem from 'fs'
import { watchFile, browserLivereload, ManageSubprocess } from '@deployment/nodejsLiveReload'
const { resolveAndLookupFile, findFileByGlobPattern } = require('@dependency/handleFilesystemOperation')
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
  const applicationPath = path.join(api.project.configuration.rootPath, 'entrypoint/cli'),
    rootPath = api.project.configuration.rootPath
  let rootServiceConfig = api.project.configuration.configuration?.apiGateway?.service.find(item => item.subdomain == null /*Root service*/)
  assert(rootServiceConfig, `Root service must be configured in the projects apiGateway configuration.`)
  let targetServiceHost = api.project.configuration.configuration?.runtimeVariable?.HOST
  assert(targetServiceHost, `HOST runtime variable must be configured in the project's runtimeVariable configuration.`)
  let clientSideProjectConfigList = api.project.configuration.configuration?.clientSideProjectConfigList
  assert(clientSideProjectConfigList, `clientSideProjectConfigList must be configured in the project's configuration.`)

  // Application
  let manageSubprocess = new ManageSubprocess({ cliAdapterPath: applicationPath })
  const runApplication = async () => {
    await clearGraphData() // run prerequesite container and clear graph
    manageSubprocess.runInSubprocess()
  }

  // Browser control
  let { restart: reloadBrowserClient } = await browserLivereload({
    targetProject: api.project /*adapter for working with target function interface.*/,
    rootServicePort: rootServiceConfig.port,
    rootServiceHost: targetServiceHost,
  })

  manageSubprocess.on('ready', () => reloadBrowserClient()) // reload browser after server reload
  await runApplication()

  {
    let serverSideList = await findFileByGlobPattern({
      basePath: rootPath,
      patternGlob: [`**/*.js`],
      ignore: [`**/{temporary/**/*,distribution/**/*,.git/**/*,node_modules/**/*}`].map(item => path.join(rootPath, item) /*related only nested paths*/),
    })

    await watchFile({
      // to be run after file notification
      triggerCallback: async () => {
        await runApplication()
      },
      fileArray: [...serverSideList],
      ignoreNodeModules: false,
      logMessage: true,
    })
  }

  {
    let clientSideList = []
    for (let { path: clientSideBasePath } of clientSideProjectConfigList)
      clientSideList = [
        ...clientSideList,
        ...(await findFileByGlobPattern({
          basePath: clientSideBasePath,
          patternGlob: ['**/*.js', '**/*.css', '**/*.html'],
          ignore: [`**/{@package*/**/*,temporary/**/*,distribution/**/*,.git/**/*,node_modules/**/*}`].map(item => path.join(clientSideBasePath, item) /*related only nested paths*/),
        })),
      ]

    await watchFile({
      // to be run after file notification
      triggerCallback: () => reloadBrowserClient(), // reload browsers
      fileArray: [...clientSideList],
      ignoreNodeModules: false,
      logMessage: true,
    })
  }
}
