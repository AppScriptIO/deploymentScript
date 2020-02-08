const { runTest } = require('@deployment/javascriptTestRunner')
const { resolveAndLookupFile } = require('@dependency/handleFilesystemOperation')
import { watchFile } from '@deployment/nodejsLiveReload'

module.exports = async function(
  {
    api /* supplied by scriptManager */,
    testPath = [], // relative or absolute paths
    jsPath = [],
    shouldCompileTest,
    shouldDebugger,
  } = {},
  // additional parameters passed to test file
  additionalParameter,
) {
  let targetProjectRootPath = api.project.configuration.rootPath // from scriptManager api.

  let testFileArray = resolveAndLookupFile({ pathArray: [...testPath], basePath: targetProjectRootPath, fileExtension: ['.test.js'] })
  let jsFileArray = resolveAndLookupFile({ pathArray: [...jsPath, ...testFileArray, targetProjectRootPath], basePath: targetProjectRootPath, fileExtension: ['.js', '.ts'] })

  let { restart: restartTest } = await runTest(
    {
      targetProject: api.project /**adapter for working with target function interface*/,
      shouldCompileTest,
      shouldDebugger,
      testFileArray,
      jsFileArray,
    },
    additionalParameter,
  )

  await watchFile({
    // to be run after file notification
    triggerCallback: () => restartTest(),
    fileArray: jsFileArray,
    ignoreNodeModules: true,
    logMessage: true,
  })
}
