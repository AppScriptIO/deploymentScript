/**
 *  run container manager with requested command.
 *  ./setup/node_modules/.bin/containerManager configuration=./setup/configuration/configuration.js entrypointConfigurationKey=test
 * */

const path = require('path')
const assert = require('assert')
const resolve = require('resolve')
const slash = require('slash') // convert backward Windows slash to Unix/Windows supported forward slash.
const moduleRootPath = `${__dirname}/../../../`
const { runscriptManagerInContainerWithClientApp } = require(moduleRootPath)
const { parseKeyValuePairSeparatedBySymbolFromArray, combineKeyValueObjectIntoString } = require('@dependency/parseKeyValuePairSeparatedBySymbol')
const ownConfig = require(path.join(moduleRootPath, 'configuration/configuration.js')) // container manager config path
const { configurationFileLookup } = require(`@dependency/configurationManagement`)

const message_prefix = `\x1b[3m\x1b[2m•[${path.basename(__filename)} JS script]:\x1b[0m`
console.group(`%s \x1b[33m%s\x1b[0m`, `${message_prefix}`, `ƒ container manager - container with volumes & requested entrypoint script`)

cliInterface()

/**
 * USAGE:
 *  script invokation from shell using: npx || yarn run || <pathToScript> (e.g. ./setup/node_modules/.bin/containerManager.js)
 *  Shell: yarn run cliAdapter configuration=<relativePathToConfigurationFromPWD> <filename>
 */
function cliInterface() {
  /** Parse arguments and initialize parameters */
  const currentDirectory = path.normalize(process.cwd()), // get current directory
    namedArgs = parseKeyValuePairSeparatedBySymbolFromArray({ array: process.argv }), // ['x=y'] --> { x: y }
    scriptPath = path.normalize(process.argv[1]) // the script that should be executed on the target application.

  let { configuration: applicationConfig, path: configurationPath } = configurationFileLookup({
    configurationPath: namedArgs.configuration,
    currentDirectory,
    configurationBasePath: ownConfig.targetApp.configurationBasePath,
  })

  // get symlink path
  let relativeScriptFromPWDPath = path.relative(currentDirectory, scriptPath),
    nodeModulesPartialPath = ['node_modules'].concat(relativeScriptFromPWDPath.split('node_modules').slice(1)).join(''), // get path elements after first node_modules appearance i.e. /x/node_modules/y --> node_modules/y
    nodeModulesParentPartialPath = relativeScriptFromPWDPath.split('node_modules').shift(), // /x/node_modules/y --> /x/
    nodeModulesParentPath = path.join(currentDirectory, nodeModulesParentPartialPath)

  const scriptManagerHostRelativePath = path.dirname(resolve.sync('@dependency/appDeploymentManager/package.json', { preserveSymlinks: true, basedir: nodeModulesParentPath })) // use 'resolve' module to allow passing 'preserve symlinks' option that is not supported by require.resolve module.

  /** invoke the helper for script execution in container  */
  console.log(`Project root path: ${applicationConfig.directory.application.hostAbsolutePath}`)
  runscriptManagerInContainerWithClientApp({
    configurationAbsoluteHostPath: configurationPath,
    application: {
      hostPath: applicationConfig.directory.application.hostAbsolutePath,
      configuration: applicationConfig,
    },
    scriptManager: {
      hostRelativePath: scriptManagerHostRelativePath,
    },
    invokedDirectly: require.main === module ? true : false,
  })
}
