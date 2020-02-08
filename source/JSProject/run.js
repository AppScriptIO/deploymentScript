import path from 'path'
import assert from 'assert'
import filesystem from 'fs'
import { watchFile, browserLivereload } from '@deployment/nodejsLiveReload'
import { ManageSubprocess } from "@dependency/handleProcess";
const { resolveAndLookupFile, findFileByGlobPattern } = require('@dependency/handleFilesystemOperation')
import * as container from './container'

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
module.exports = async function({ api /* supplied by scriptManager */, application = [] } = {}) {
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
    await container.memgraph.clearGraphData({ memgraph: application[1]?.memgraph }) // run prerequesite container and clear graph
    manageSubprocess.runInSubprocess(...application)
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
