"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _path = _interopRequireDefault(require("path"));

var _nodeSsh = _interopRequireDefault(require("node-ssh"));

var _configuration = _interopRequireDefault(require("../../../../setup/configuration/configuration.js"));

var _parseKeyValuePairSeparatedBySymbol = require("../utility/parseKeyValuePairSeparatedBySymbol.js");

const {
  execSync,
  spawn,
  spawnSync
} = require('child_process');

const applicationPath = _path.default.join(_configuration.default.directory.projectPath, 'application');

const appDeploymentLifecycle = _path.default.join(applicationPath, 'dependency/appDeploymentLifecycle');

console.group('• Running entrypoint application in Manager Container:');
console.log(`- passed process arguments: ${JSON.stringify(process.argv)}`);
const namedArgs = (0, _parseKeyValuePairSeparatedBySymbol.parseKeyValuePairSeparatedBySymbolFromArray)({
  array: process.argv
}); // ['x=y'] --> { x: y }

/*
 * Usage:
 * • ./entrypoint.sh production remoteIP=<remote prod vm> [imageTag=<version saved in dockerhub >]
 */

let ymlFile = `${appDeploymentLifecycle}/deploymentContainer/production.dockerStack.yml`;
let serviceName = 'nodejs';
let containerPrefix = 'app';

switch (process.argv[0]) {
  default:
    deployProjectionStack({});
    break;
} // use ssh to connect to remote server and send production.dockerStack.yml file then execute stack deployment


async function deployProjectionStack({}) {
  let remoteWorkingDirectory = '/tmp/sshUploadedFile'; // connect to remote vm

  const ssh = new _nodeSsh.default();
  await ssh.connect({
    host: namedArgs.remoteIP,
    port: '22',
    username: process.env.sshUsername,
    privateKey: _path.default.join(_configuration.default.directory.projectPath, '.ssh/google_compute_engine'),
    readyTimeout: 120000
  }).catch(error => {
    throw error;
  }).then(() => {
    console.log('SSH Connection successful');
  }); // upload yml file

  await ssh.putFile(ymlFile, _path.default.join(remoteWorkingDirectory, 'production.dockerStack.yml')).then(function () {
    console.log(`production.dockerStack.yml uploaded to ${remoteWorkingDirectory}/production.dockerStack.yml`);
  }, function (error) {
    console.log('Failed to upload production.dockerStack.yml file.');
    console.log(error);
  }); // TODO: before deploying the stack, make sure the required folders for docker container mount are present if not create them.
  // deploy stack

  let stackName = _configuration.default.stackName;
  let environmentVariable = {
    imageName: _configuration.default.dockerImageName,
    imageTag: namedArgs.imageTag || 'latest',
    domain: _configuration.default.domain,
    hostStorageFolderName: _configuration.default.hostStorageFolderName
  };
  let inlineArgument = (0, _parseKeyValuePairSeparatedBySymbol.combineKeyValueObjectIntoString)({
    object: environmentVariable
  }); // pass variables by prefixing argumnets before docker stack command

  await ssh.execCommand( // env $(cat .env | grep ^[A-Z] | xargs) // create from env varibales inline command arguments, just like below
  `sudo ${inlineArgument} docker stack deploy -c ./production.dockerStack.yml ${stackName}`, {
    cwd: remoteWorkingDirectory,
    stream: 'stdout',
    options: {// env: environmentVariable // doesn't work, issue with ssh2 module & another issue with docker stack not passing environment variables.
    }
  }).then(function (output) {
    console.log('stdout:');
    console.log(output.stdout);
  });
  console.log('• Closing connection.');
  ssh.dispose(); // close connection
}