"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.unitTest = unitTest;var _path = _interopRequireDefault(require("path"));
const { execSync, spawn, spawnSync } = require('child_process');
const deploymentScriptPath = _path.default.dirname(require.resolve('@deployment/deploymentScript/package.json')),
javascriptTestRunnerPath = _path.default.normalize(`${__dirname}/../entrypoint/cli/transpilation.entrypoint.js`);







function unitTest(
input)


{
  let configuration,
  container = {},
  nodeFlag = {},
  testRunnerModulePath,
  testPath,
  applicationPathOnHostMachine;
  ({
    configuration,
    container = {
      imageName: container.imageName = configuration.dockerImageName,
      ymlFile: container.ymlFile = `${deploymentScriptPath}/deploymentContainer/deployment.dockerCompose.yml` },

    nodeFlag = {
      debug: nodeFlag.debug = null,
      break: nodeFlag.break = null },

    testRunnerModulePath = javascriptTestRunnerPath,
    testPath = configuration.directory.testPath,
    applicationPathOnHostMachine = _path.default.join(configuration.directory.projectPath, 'application') } =
  input);

  let serviceName = 'nodejs',
  containerPrefix = 'app_test';

  console.log(`\x1b[33m\x1b[1m\x1b[7m\x1b[36m%s\x1b[0m \x1b[2m\x1b[3m%s\x1b[0m`, `Running Container:`, `NodeJS App`);
  let debugCommand = nodeFlag.debug ? `--inspect${nodeFlag ? '-brk' : ''}=0.0.0.0:9229` : '';
  let appEntrypointPath = testRunnerModulePath;
  let firstNodeCommand = testPath;


  let containerCommand = `node ${debugCommand} ${appEntrypointPath} ${firstNodeCommand}`;

  let environmentVariable = {
    DEPLOYMENT: 'development',
    SZN_DEBUG: false,
    applicationPathOnHostMachine,
    imageName: container.imageName };

  let processCommand = 'docker-compose',
  processCommandArgs = [`-f ${container.ymlFile}`, `--project-name ${containerPrefix}`, `run --service-ports --use-aliases`, `--entrypoint "${containerCommand}"`, `${serviceName}`],
  processOption = {

    shell: true,
    detached: false,
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    env: Object.assign(
    process.env,
    environmentVariable) };


  console.log(`%s %s`, processCommand, processCommandArgs.join(' '));
  let childProcess = spawn(processCommand, processCommandArgs, processOption);
  childProcess.on('error', function (err) {
    throw err;
  });
  childProcess.on('exit', () => {
    console.log(`PID: Child ${childProcess.pid} terminated.`);
  });

  console.log(`PID: Child ${childProcess.pid}`);
  process.on('SIGINT', () => {

    console.log('• Caught interrupt signal - host machine level');
    childProcess.kill('SIGINT');
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9kZXByZWNhdGVkL3Rlc3RSdW5JbkNvbnRhaW5lci9zY3JpcHQuanMiXSwibmFtZXMiOlsiZXhlY1N5bmMiLCJzcGF3biIsInNwYXduU3luYyIsInJlcXVpcmUiLCJkZXBsb3ltZW50U2NyaXB0UGF0aCIsInBhdGgiLCJkaXJuYW1lIiwicmVzb2x2ZSIsImphdmFzY3JpcHRUZXN0UnVubmVyUGF0aCIsIm5vcm1hbGl6ZSIsIl9fZGlybmFtZSIsInVuaXRUZXN0IiwiaW5wdXQiLCJjb25maWd1cmF0aW9uIiwiY29udGFpbmVyIiwibm9kZUZsYWciLCJ0ZXN0UnVubmVyTW9kdWxlUGF0aCIsInRlc3RQYXRoIiwiYXBwbGljYXRpb25QYXRoT25Ib3N0TWFjaGluZSIsImltYWdlTmFtZSIsImRvY2tlckltYWdlTmFtZSIsInltbEZpbGUiLCJkZWJ1ZyIsImJyZWFrIiwiZGlyZWN0b3J5Iiwiam9pbiIsInByb2plY3RQYXRoIiwic2VydmljZU5hbWUiLCJjb250YWluZXJQcmVmaXgiLCJjb25zb2xlIiwibG9nIiwiZGVidWdDb21tYW5kIiwiYXBwRW50cnlwb2ludFBhdGgiLCJmaXJzdE5vZGVDb21tYW5kIiwiY29udGFpbmVyQ29tbWFuZCIsImVudmlyb25tZW50VmFyaWFibGUiLCJERVBMT1lNRU5UIiwiU1pOX0RFQlVHIiwicHJvY2Vzc0NvbW1hbmQiLCJwcm9jZXNzQ29tbWFuZEFyZ3MiLCJwcm9jZXNzT3B0aW9uIiwic2hlbGwiLCJkZXRhY2hlZCIsInN0ZGlvIiwiZW52IiwiT2JqZWN0IiwiYXNzaWduIiwicHJvY2VzcyIsImNoaWxkUHJvY2VzcyIsIm9uIiwiZXJyIiwicGlkIiwia2lsbCJdLCJtYXBwaW5ncyI6IjRMQUFBO0FBQ0EsTUFBTSxFQUFFQSxRQUFGLEVBQVlDLEtBQVosRUFBbUJDLFNBQW5CLEtBQWlDQyxPQUFPLENBQUMsZUFBRCxDQUE5QztBQUNBLE1BQU1DLG9CQUFvQixHQUFHQyxjQUFLQyxPQUFMLENB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QUl1QixZQUFZLEdBQUcvQyxLQUFLLENBQUNxQyxjQUFELEVBQWlCQyxrQkFBakIsRUFBcUNDLGFBQXJDLENBQXhCO0FBQ0FRLEVBQUFBLFlBQVksQ0FBQ0MsRUFBYixDQUFnQixPQUFoQixFQUF5QixVQUFTQyxHQUFULEVBQWM7QUFDckMsVUFBTUEsR0FBTjtBQUNELEdBRkQ7QUFHQUYsRUFBQUEsWUFBWSxDQUFDQyxFQUFiLENBQWdCLE1BQWhCLEVBQXdCLE1BQU07QUFDNUJwQixJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBYSxjQUFha0IsWUFBWSxDQUFDRyxHQUFJLGNBQTNDO0FBQ0QsR0FGRDs7QUFJQXRCLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFhLGNBQWFrQixZQUFZLENBQUNHLEdBQUksRUFBM0M7QUFDQUosRUFBQUEsT0FBTyxDQUFDRSxFQUFSLENBQVcsUUFBWCxFQUFxQixNQUFNOztBQUV6QnBCLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGdEQUFaO0FBQ0FrQixJQUFBQSxZQUFZLENBQUNJLElBQWIsQ0FBa0IsUUFBbEI7QUFDRCxHQUpEO0FBS0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuY29uc3QgeyBleGVjU3luYywgc3Bhd24sIHNwYXduU3luYyB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpXG5jb25zdCBkZXBsb3ltZW50U2NyaXB0UGF0aCA9IHBhdGguZGlybmFtZShyZXF1aXJlLnJlc29sdmUoJ0BkZXBsb3ltZW50L2RlcGxveW1lbnRTY3JpcHQvcGFja2FnZS5qc29uJykpLFxuICBqYXZhc2NyaXB0VGVzdFJ1bm5lclBhdGggPSBwYXRoLm5vcm1hbGl6ZShgJHtfX2Rpcm5hbWV9Ly4uL2VudHJ5cG9pbnQvY2xpL3RyYW5zcGlsYXRpb24uZW50cnlwb2ludC5qc2ApXG5cbi8qXG4gKiBVc2FnZTpcbiAqIOKAoiAuL2VudHJ5cG9pbnQuc2ggdGVzdCB1bml0VGVzdFxuICog4oCiIC4vZW50cnlwb2ludC5zaCB0ZXN0IHVuaXRUZXN0IGRlYnVnXG4gKiDigKIgLi9lbnRyeXBvaW50LnNoIHRlc3QgdW5pdFRlc3QgcGF0aD08cGF0aFRvRmlsZT4vZW50cnlwb2ludC50ZXN0LmpzIC8vIHNpbmdsZSB0ZXN0IGZpbGUgZXhlY3V0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5pdFRlc3QoXG4gIGlucHV0LFxuICAvLyBXaGVuIHJ1bm5pbmcgaW5zaWRlIGNvbnRhaW5lciwgZG9ja2VyIGNsaWVudCBjb21tdW5pY2F0ZXMgd2l0aCBNb2JleUxpbnV4Vk0gb24gV2luZG93cyBob3N0IG1hY2hpbmUsIGFuZCB0aGUgdm9sdW1lIHBhdGhzIHdpbGwgYmUgcmVsYXRlZCBvciByZWZlcmVuY2luZyB0byB0aGUgaHlwZXItdiBNb2J5TGludXhWTSB2bS4gSW4gaXQgaGVyZSBpcyBhIGZvbGRlciAvaG9zdF9tb3VudC9jIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIFdpZG5vd3MgaG9zdCBmaWxlc3lzdGVtIGRyaXZlLlxuICAvLyB3aGVuIHZhcmlhYmxlIG5hbWVzIGFyZSBzaW1pbGFyIGRlY2xhcmluZyB0aGUgdmFyaWFibGUgYW5kIGFzc2lnbmluZyBpdCBpbiB0aGUgZmlyc3Qgb2JqZWN0IGNhdXNlcyBub3QgZGVmaW5lZCBSZWZlcmVuY2VFcnJvci5cbikge1xuICBsZXQgY29uZmlndXJhdGlvbixcbiAgICBjb250YWluZXIgPSB7fSxcbiAgICBub2RlRmxhZyA9IHt9LFxuICAgIHRlc3RSdW5uZXJNb2R1bGVQYXRoLFxuICAgIHRlc3RQYXRoLFxuICAgIGFwcGxpY2F0aW9uUGF0aE9uSG9zdE1hY2hpbmVcbiAgOyh7XG4gICAgY29uZmlndXJhdGlvbixcbiAgICBjb250YWluZXIgPSB7XG4gICAgICBpbWFnZU5hbWU6IChjb250YWluZXIuaW1hZ2VOYW1lID0gY29uZmlndXJhdGlvbi5kb2NrZXJJbWFnZU5hbWUpLFxuICAgICAgeW1sRmlsZTogKGNvbnRhaW5lci55bWxGaWxlID0gYCR7ZGVwbG95bWVudFNjcmlwdFBhdGh9L2RlcGxveW1lbnRDb250YWluZXIvZGVwbG95bWVudC5kb2NrZXJDb21wb3NlLnltbGApLFxuICAgIH0sXG4gICAgbm9kZUZsYWcgPSB7XG4gICAgICBkZWJ1ZzogKG5vZGVGbGFnLmRlYnVnID0gbnVsbCksXG4gICAgICBicmVhazogKG5vZGVGbGFnLmJyZWFrID0gbnVsbCksXG4gICAgfSxcbiAgICB0ZXN0UnVubmVyTW9kdWxlUGF0aCA9IGphdmFzY3JpcHRUZXN0UnVubmVyUGF0aCwgLy8gcGF0aCBvZiB0aGUgbW9kdWxlIHRoYXQgaW5jbHVkZXMgdGhlIHRlc3QgZnJhbWV3b3JrLlxuICAgIHRlc3RQYXRoID0gY29uZmlndXJhdGlvbi5kaXJlY3RvcnkudGVzdFBhdGgsIC8vIHBhdGggdG8gdGVzdCBkaXJlY3RvcnkuXG4gICAgYXBwbGljYXRpb25QYXRoT25Ib3N0TWFjaGluZSA9IHBhdGguam9pbihjb25maWd1cmF0aW9uLmRpcmVjdG9yeS5wcm9qZWN0UGF0aCwgJ2FwcGxpY2F0aW9uJyksIC8vIHRoaXMgcGF0aCBzaG91bGQgYmUgYWxyZWFkeSByZXNvbHZlZCB0byBVbml4IHBhdGggZnJvbSBXaW5kb3dzIHBhdGggaW5jbHVkaW5nIHRoZSBkcml2ZSBsZXR0ZXIsIHdoaWNoIHdpbGwgYmUgdXNlZCBpbiBNb2J5TGludXhWTS5cbiAgfSA9IGlucHV0KSAvLyBkZXN0cnVjdHVyZSBuZXN0ZWQgb2JqZWN0cyB0byB0aGUgb2JqZWN0IHByb3BlcnRpZXMgdGhlbXNlbHZlcy5cblxuICBsZXQgc2VydmljZU5hbWUgPSAnbm9kZWpzJyxcbiAgICBjb250YWluZXJQcmVmaXggPSAnYXBwX3Rlc3QnXG5cbiAgY29uc29sZS5sb2coYFxceDFiWzMzbVxceDFiWzFtXFx4MWJbN21cXHgxYlszNm0lc1xceDFiWzBtIFxceDFiWzJtXFx4MWJbM20lc1xceDFiWzBtYCwgYFJ1bm5pbmcgQ29udGFpbmVyOmAsIGBOb2RlSlMgQXBwYClcbiAgbGV0IGRlYnVnQ29tbWFuZCA9IG5vZGVGbGFnLmRlYnVnID8gYC0taW5zcGVjdCR7bm9kZUZsYWcgPyAnLWJyaycgOiAnJ309MC4wLjAuMDo5MjI5YCA6ICcnXG4gIGxldCBhcHBFbnRyeXBvaW50UGF0aCA9IHRlc3RSdW5uZXJNb2R1bGVQYXRoXG4gIGxldCBmaXJzdE5vZGVDb21tYW5kID0gdGVzdFBhdGggLy8gY29tbWFuZCBwYXNzZWQgdG8gbm9kZSBtb2R1bGUgZW52aXJvbm1lbnRcbiAgLy8gUHJpbnQgY29udGFpbmVyIHRpdGxlXG4gIC8vIGxldCBwcmludE1lc3NhZ2VOb2RlQ29tbWFuZCA9IGBub2RlIC0tZXZhbCBcImNvbnNvbGUubG9nKFN0cmluZygvJHtjb250YWluZXJTdGFydHVwTWVzc2FnZX0vKS5zdWJzdHJpbmcoMSkuc2xpY2UoMCwtMSkpXCJgIC8vIFN0cmluZygvQWxsb3dzIHRvIHdyaXRlIHN0cmluZyB3aXRob3V0IHFvdXRlcy8pLnN1YnN0cmluZygxKS5zbGljZSgwLC0xKSAvLyBxb3V0ZXMgYXJlIGJlaW5nIHN0cmlwcGVkIGZvciBzb21lIHJlYXNvbiwgcHJvYmFibHkgYnkgZG9ja2VyLWNvbXBvc2UuXG4gIGxldCBjb250YWluZXJDb21tYW5kID0gYG5vZGUgJHtkZWJ1Z0NvbW1hbmR9ICR7YXBwRW50cnlwb2ludFBhdGh9ICR7Zmlyc3ROb2RlQ29tbWFuZH1gXG5cbiAgbGV0IGVudmlyb25tZW50VmFyaWFibGUgPSB7XG4gICAgREVQTE9ZTUVOVDogJ2RldmVsb3BtZW50JyxcbiAgICBTWk5fREVCVUc6IGZhbHNlLFxuICAgIGFwcGxpY2F0aW9uUGF0aE9uSG9zdE1hY2hpbmUsXG4gICAgaW1hZ2VOYW1lOiBjb250YWluZXIuaW1hZ2VOYW1lLFxuICB9XG4gIGxldCBwcm9jZXNzQ29tbWFuZCA9ICdkb2NrZXItY29tcG9zZScsXG4gICAgcHJvY2Vzc0NvbW1hbmRBcmdzID0gW2AtZiAke2NvbnRhaW5lci55bWxGaWxlfWAsIGAtLXByb2plY3QtbmFtZSAke2NvbnRhaW5lclByZWZpeH1gLCBgcnVuIC0tc2VydmljZS1wb3J0cyAtLXVzZS1hbGlhc2VzYCwgYC0tZW50cnlwb2ludCBcIiR7Y29udGFpbmVyQ29tbWFuZH1cImAsIGAke3NlcnZpY2VOYW1lfWBdLFxuICAgIHByb2Nlc3NPcHRpb24gPSB7XG4gICAgICAvLyBjd2Q6IGAke2FwcGxpY2F0aW9uUGF0aE9uSG9zdE1hY2hpbmV9YCxcbiAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgZGV0YWNoZWQ6IGZhbHNlLFxuICAgICAgc3RkaW86IFsnaW5oZXJpdCcsICdpbmhlcml0JywgJ2luaGVyaXQnLCAnaXBjJ10sXG4gICAgICBlbnY6IE9iamVjdC5hc3NpZ24oXG4gICAgICAgIHByb2Nlc3MuZW52LCAvLyBQQVRIIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHJlcXVpcmVkIGZvciBkb2NrZXItY29tcG9zZXIgdG8gcnVuLiAgUEFUSCAtIHNwZWNpZmllcyB0aGUgZGlyZWN0b3JpZXMgaW4gd2hpY2ggZXhlY3V0YWJsZSBwcm9ncmFtc1xuICAgICAgICBlbnZpcm9ubWVudFZhcmlhYmxlLFxuICAgICAgKSxcbiAgICB9XG4gIGNvbnNvbGUubG9nKGAlcyAlc2AsIHByb2Nlc3NDb21tYW5kLCBwcm9jZXNzQ29tbWFuZEFyZ3Muam9pbignICcpKVxuICBsZXQgY2hpbGRQcm9jZXNzID0gc3Bhd24ocHJvY2Vzc0NvbW1hbmQsIHByb2Nlc3NDb21tYW5kQXJncywgcHJvY2Vzc09wdGlvbilcbiAgY2hpbGRQcm9jZXNzLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycikge1xuICAgIHRocm93IGVyclxuICB9KVxuICBjaGlsZFByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coYFBJRDogQ2hpbGQgJHtjaGlsZFByb2Nlc3MucGlkfSB0ZXJtaW5hdGVkLmApXG4gIH0pXG4gIC8vIGNoaWxkUHJvY2Vzcy51bnJlZigpIC8vIHByZXZlbnQgcGFyZW50IGZyb20gd2FpdGluZyB0byBjaGlsZCBwcm9jZXNzIGFuZCB1biByZWZlcmVuY2UgY2hpbGQgZnJvbSBwYXJlbnQncyBldmVudCBsb29wLlxuICBjb25zb2xlLmxvZyhgUElEOiBDaGlsZCAke2NoaWxkUHJvY2Vzcy5waWR9YClcbiAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgIC8vIHdoZW4gZG9ja2VyIGlzIHVzaW5nIGAtaXRgIG9wdGlvbiB0aGlzIGV2ZW50IHdvbid0IGJlIGZpcmVkIGluIHRoaXMgcHJvY2VzcywgYXMgdGhlIFNJR0lOVCBzaWduYWwgaXMgcGFzc2VkIGRpcmVjdGx5IHRvIHRoZSBkb2NrZXIgY29udGFpbmVyLlxuICAgIGNvbnNvbGUubG9nKCfigKIgQ2F1Z2h0IGludGVycnVwdCBzaWduYWwgLSBob3N0IG1hY2hpbmUgbGV2ZWwnKVxuICAgIGNoaWxkUHJvY2Vzcy5raWxsKCdTSUdJTlQnKVxuICB9KVxufVxuIl19