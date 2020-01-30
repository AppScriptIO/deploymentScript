"use strict";var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");var _path = _interopRequireDefault(require("path"));
var _assert = _interopRequireDefault(require("assert"));

var _nodejsLiveReload = require("@deployment/nodejsLiveReload");


var memgraphContainer = _interopRequireWildcard(require("./container/memgraphContainer.js"));const { resolveAndLookupFile, findFileByGlobPattern } = require('@dependency/handleFilesystemOperation');const boltProtocolDriver = require('neo4j-driver').v1;

async function clearGraphData() {
  console.groupCollapsed('• Run prerequisite containers:');
  memgraphContainer.runDockerContainer();
  console.groupEnd();

  console.log('• Cleared graph database.');
  const url = { protocol: 'bolt', hostname: 'localhost', port: 7687 },
  authentication = { username: 'neo4j', password: 'test' };
  const graphDBDriver = boltProtocolDriver.driver(`${url.protocol}://${url.hostname}:${url.port}`, boltProtocolDriver.auth.basic(authentication.username, authentication.password));
  let session = await graphDBDriver.session();
  let result = await session.run(`match (n) detach delete n`);
  session.close();
}

function setInterval({ interval = 1000 } = {}) {

  console.log(`Executing interval in ${__filename}. NodeJS version: ${JSON.stringify(process.versions)}`);
  setInterval(() => console.info('Sleeping...'), interval);
}
const setTimeout = ({ timeout = 10000 } = {}) => setTimeout(() => console.log('setTimeout command ended. The process will exit now.'), timeout);














module.exports = async function ({ api } = {}) {var _api$project$configur, _api$project$configur2, _api$project$configur3, _api$project$configur4, _api$project$configur5;
  const applicationPath = _path.default.join(api.project.configuration.rootPath, 'entrypoint/cli'),
  rootPath = api.project.configuration.rootPath;
  let rootServiceConfig = (_api$project$configur = api.project.configuration.configuration) === null || _api$project$configur === void 0 ? void 0 : (_api$project$configur2 = _api$project$configur.apiGateway) === null || _api$project$configur2 === void 0 ? void 0 : _api$project$configur2.service.find(item => item.subdomain == null);
  (0, _assert.default)(rootServiceConfig, `Root service must be configured in the projects apiGateway configuration.`);
  let targetServiceHost = (_api$project$configur3 = api.project.configuration.configuration) === null || _api$project$configur3 === void 0 ? void 0 : (_api$project$configur4 = _api$project$configur3.runtimeVariable) === null || _api$project$configur4 === void 0 ? void 0 : _api$project$configur4.HOST;
  (0, _assert.default)(targetServiceHost, `HOST runtime variable must be configured in the project's runtimeVariable configuration.`);
  let clientSideProjectConfigList = (_api$project$configur5 = api.project.configuration.configuration) === null || _api$project$configur5 === void 0 ? void 0 : _api$project$configur5.clientSideProjectConfigList;
  (0, _assert.default)(clientSideProjectConfigList, `clientSideProjectConfigList must be configured in the project's configuration.`);


  let manageSubprocess = new _nodejsLiveReload.ManageSubprocess({ cliAdapterPath: applicationPath });
  const runApplication = async () => {
    await clearGraphData();
    manageSubprocess.runInSubprocess();
  };


  let { restart: reloadBrowserClient } = await (0, _nodejsLiveReload.browserLivereload)({
    targetProject: api.project,
    rootServicePort: rootServiceConfig.port,
    rootServiceHost: targetServiceHost });


  manageSubprocess.on('ready', () => reloadBrowserClient());
  await runApplication();

  {
    let serverSideList = await findFileByGlobPattern({
      basePath: rootPath,
      patternGlob: [`**/*.js`],
      ignore: [`**/{temporary/**/*,distribution/**/*,.git/**/*,node_modules/**/*}`].map(item => _path.default.join(rootPath, item)) });


    await (0, _nodejsLiveReload.watchFile)({

      triggerCallback: async () => {
        await runApplication();
      },
      fileArray: [...serverSideList],
      ignoreNodeModules: false,
      logMessage: true });

  }

  {
    let clientSideList = [];
    for (let { path: clientSideBasePath } of clientSideProjectConfigList)
    clientSideList = [
    ...clientSideList,
    ...(await findFileByGlobPattern({
      basePath: clientSideBasePath,
      patternGlob: ['**/*.js', '**/*.css', '**/*.html'],
      ignore: [`**/{@package*/**/*,temporary/**/*,distribution/**/*,.git/**/*,node_modules/**/*}`].map(item => _path.default.join(clientSideBasePath, item)) }))];



    await (0, _nodejsLiveReload.watchFile)({

      triggerCallback: () => reloadBrowserClient(),
      fileArray: [...clientSideList],
      ignoreNodeModules: false,
      logMessage: true });

  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvcnVuLmpzIl0sIm5hbWVzIjpbInJlc29sdmVBbmRMb29rdXBGaWxlIiwiZmluZEZpbGVCeUdsb2JQYXR0ZXJuIiwicmVxdWlyZSIsImJvbHRQcm90b2NvbERyaXZlciIsInYxIiwiY2xlYXJHcmFwaERhdGEiLCJjb25zb2xlIiwiZ3JvdXBDb2xsYXBzZWQiLCJtZW1ncmFwaENvbnRhaW5lciIsInJ1bkRvY2tlckNvbnRhaW5lciIsImdyb3VwRW5kIiwibG9nIiwidXJsIiwicHJvdG9jb2wiLCJob3N0bmFtZSIsInBvcnQiLCJhdXRoZW50aWNhdGlvbiIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJncmFwaERCRHJpdmVyIiwiZHJpdmVyIiwiYXV0aCIsImJhc2ljIiwic2Vzc2lvbiIsInJlc3VsdCIsInJ1biIsImNsb3NlIiwic2V0SW50ZXJ2YWwiLCJpbnRlcnZhbCIsIl9fZmlsZW5hbWUiLCJKU09OIiwic3RyaW5naWZ5IiwicHJvY2VzcyIsInZlcnNpb25zIiwiaW5mbyIsInNldFRpbWVvdXQiLCJ0aW1lb3V0IiwibW9kdWxlIiwiZXhwb3J0cyIsImFwaSIsImFwcGxpY2F0aW9uUGF0aCIsInBhdGgiLCJqb2luIiwicHJvamVjdCIsImNvbmZpZ3VyYXRpb24iLCJyb290UGF0aCIsInJvb3RTZXJ2aWNlQ29uZmlnIiwiYXBpR2F0ZXdheSIsInNlcnZpY2UiLCJmaW5kIiwiaXRlbSIsInN1YmRvbWFpbiIsInRhcmdldFNlcnZpY2VIb3N0IiwicnVudGltZVZhcmlhYmxlIiwiSE9TVCIsImNsaWVudFNpZGVQcm9qZWN0Q29uZmlnTGlzdCIsIm1hbmFnZVN1YnByb2Nlc3MiLCJNYW5hZ2VTdWJwcm9jZXNzIiwiY2xpQWRhcHRlclBhdGgiLCJydW5BcHBsaWNhdGlvbiIsInJ1bkluU3VicHJvY2VzcyIsInJlc3RhcnQiLCJyZWxvYWRCcm93c2VyQ2xpZW50IiwidGFyZ2V0UHJvamVjdCIsInJvb3RTZXJ2aWNlUG9ydCIsInJvb3RTZXJ2aWNlSG9zdCIsIm9uIiwic2VydmVyU2lkZUxpc3QiLCJiYXNlUGF0aCIsInBhdHRlcm5HbG9iIiwiaWdub3JlIiwibWFwIiwidHJpZ2dlckNhbGxiYWNrIiwiZmlsZUFycmF5IiwiaWdub3JlTm9kZU1vZHVsZXMiLCJsb2dNZXNzYWdlIiwiY2xpZW50U2lkZUxpc3QiLCJjbGllbnRTaWRlQmFzZVBhdGgiXSwibWFwcGluZ3MiOiJ5TEFBQTtBQUNBOztBQUVBOzs7QUFHQSw2RkFGQSxNQUFNLEVBQUVBLG9CQUFGLEVBQXdCQyxxQkFBeEIsS0FBa0RDLE9BQU8sQ0FBQyx1Q0FBRCxDQUEvRCxDQUNBLE1BQU1DLGtCQUFrQixHQUFHRCxPQUFPLENBQUMsY0FBRCxDQUFQLENBQXdCRSxFQUFuRDs7QUFHQSxlQUFlQyxjQUFmLEdBQWdDO0FBQzlCQyxFQUFBQSxPQUFPLENBQUNDLGNBQVIsQ0FBdUIsZ0NBQXZCO0FBQ0FDLEVBQUFBLGlCQUFpQixDQUFDQyxrQkFBbEI7QUFDQUgsRUFBQUEsT0FBTyxDQUFDSSxRQUFSOztBQUVBSixFQUFBQSxPQUFPLENBQUNLLEdBQVIsQ0FBWSwyQkFBWjtBQUNBLFFBQU1DLEdBQUcsR0FBRyxFQUFFQyxRQUFRLEVBQUUsTUFBWixFQUFvQkMsUUFBUSxFQUFFLFdBQTlCLEVBQTJDQyxJQUFJLEVBQUUsSUFBakQsRUFBWjtBQUNFQyxFQUFBQSxjQUFjLEdBQUcsRUFBRUMsUUFBUSxFQUFFLE9BQVosRUFBcUJDLFFBQVEsRUFBRSxNQUEvQixFQURuQjtBQUVBLFFBQU1DLGFBQWEsR0FBR2hCLGtCQUFrQixDQUFDaUIsTUFBbkIsQ0FBMkIsR0FBRVIsR0FBRyxDQUFDQyxRQUFTLE1BQUtELEdBQUcsQ0FBQ0UsUUFBUyxJQUFHRixHQUFHLENBQUNHLElBQUssRUFBeEUsRUFBMkVaLGtCQUFrQixDQUFDa0IsSUFBbkIsQ0FBd0JDLEtBQXhCLENBQThCTixjQUFjLENBQUNDLFFBQTdDLEVBQXVERCxjQUFjLENBQUNFLFFBQXRFLENBQTNFLENBQXRCO0FBQ0Es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ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0J1xyXG5pbXBvcnQgZmlsZXN5c3RlbSBmcm9tICdmcydcclxuaW1wb3J0IHsgd2F0Y2hGaWxlLCBicm93c2VyTGl2ZXJlbG9hZCwgTWFuYWdlU3VicHJvY2VzcyB9IGZyb20gJ0BkZXBsb3ltZW50L25vZGVqc0xpdmVSZWxvYWQnXHJcbmNvbnN0IHsgcmVzb2x2ZUFuZExvb2t1cEZpbGUsIGZpbmRGaWxlQnlHbG9iUGF0dGVybiB9ID0gcmVxdWlyZSgnQGRlcGVuZGVuY3kvaGFuZGxlRmlsZXN5c3RlbU9wZXJhdGlvbicpXHJcbmNvbnN0IGJvbHRQcm90b2NvbERyaXZlciA9IHJlcXVpcmUoJ25lbzRqLWRyaXZlcicpLnYxXHJcbmltcG9ydCAqIGFzIG1lbWdyYXBoQ29udGFpbmVyIGZyb20gJy4vY29udGFpbmVyL21lbWdyYXBoQ29udGFpbmVyLmpzJ1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2xlYXJHcmFwaERhdGEoKSB7XHJcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZCgn4oCiIFJ1biBwcmVyZXF1aXNpdGUgY29udGFpbmVyczonKVxyXG4gIG1lbWdyYXBoQ29udGFpbmVyLnJ1bkRvY2tlckNvbnRhaW5lcigpIC8vIHRlbXBvcmFyeSBzb2x1dGlvblxyXG4gIGNvbnNvbGUuZ3JvdXBFbmQoKVxyXG4gIC8vIERlbGV0ZSBhbGwgbm9kZXMgaW4gdGhlIGluLW1lbW9yeSBkYXRhYmFzZVxyXG4gIGNvbnNvbGUubG9nKCfigKIgQ2xlYXJlZCBncmFwaCBkYXRhYmFzZS4nKVxyXG4gIGNvbnN0IHVybCA9IHsgcHJvdG9jb2w6ICdib2x0JywgaG9zdG5hbWU6ICdsb2NhbGhvc3QnLCBwb3J0OiA3Njg3IH0sXHJcbiAgICBhdXRoZW50aWNhdGlvbiA9IHsgdXNlcm5hbWU6ICduZW80aicsIHBhc3N3b3JkOiAndGVzdCcgfVxyXG4gIGNvbnN0IGdyYXBoREJEcml2ZXIgPSBib2x0UHJvdG9jb2xEcml2ZXIuZHJpdmVyKGAke3VybC5wcm90b2NvbH06Ly8ke3VybC5ob3N0bmFtZX06JHt1cmwucG9ydH1gLCBib2x0UHJvdG9jb2xEcml2ZXIuYXV0aC5iYXNpYyhhdXRoZW50aWNhdGlvbi51c2VybmFtZSwgYXV0aGVudGljYXRpb24ucGFzc3dvcmQpKVxyXG4gIGxldCBzZXNzaW9uID0gYXdhaXQgZ3JhcGhEQkRyaXZlci5zZXNzaW9uKClcclxuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2Vzc2lvbi5ydW4oYG1hdGNoIChuKSBkZXRhY2ggZGVsZXRlIG5gKVxyXG4gIHNlc3Npb24uY2xvc2UoKVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRJbnRlcnZhbCh7IGludGVydmFsID0gMTAwMCB9ID0ge30pIHtcclxuICAvLyAoZnVuY3Rpb24gZW5kbGVzc1Byb2Nlc3MoKSB7IHByb2Nlc3MubmV4dFRpY2soZW5kbGVzc1Byb2Nlc3MpIH0pKCkgLy8gUmVhZGFibGUgc29sdXRpb24gYnV0IGl0IHV0aWxpemVzIGFsbCBhdmFpbGFibGUgQ1BVLiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTA4MjUyNy9ob3ctdG8tcHJldmVudC10aGUtbm9kZWpzLWV2ZW50LWxvb3AtZnJvbS1leGl0aW5nXHJcbiAgY29uc29sZS5sb2coYEV4ZWN1dGluZyBpbnRlcnZhbCBpbiAke19fZmlsZW5hbWV9LiBOb2RlSlMgdmVyc2lvbjogJHtKU09OLnN0cmluZ2lmeShwcm9jZXNzLnZlcnNpb25zKX1gKVxyXG4gIHNldEludGVydmFsKCgpID0+IGNvbnNvbGUuaW5mbygnU2xlZXBpbmcuLi4nKSwgaW50ZXJ2YWwpXHJcbn1cclxuY29uc3Qgc2V0VGltZW91dCA9ICh7IHRpbWVvdXQgPSAxMDAwMCB9ID0ge30pID0+IHNldFRpbWVvdXQoKCkgPT4gY29uc29sZS5sb2coJ3NldFRpbWVvdXQgY29tbWFuZCBlbmRlZC4gVGhlIHByb2Nlc3Mgd2lsbCBleGl0IG5vdy4nKSwgdGltZW91dClcclxuXHJcbi8qXHJcbiAgUnVuIHdlYmFwcCBwcm9qZWN0OiBcclxuXHJcbiAgVGFrZXMgaW50byBjb25zaWRlcmF0aW9uOiBcclxuICAgIC0gZGVidWdnZXJcclxuICAgIC0gbGl2ZXJlbG9hZFxyXG5cclxuICBBbGdvcml0aG06IFxyXG4gICAgLSB3YXRjaCBmaWxlcyBvZiBkaWZmZXJlbnQgZ3JvdXBzLlxyXG4gICAgLSBzdGFydCB3ZWJhcHAgYXBwbGljYXRpb24gc2VydmVyLlxyXG4gICAgLSBzdGFydCBicm93c2VyIHByb3h5IGxpdmVyZWxvYWQgc2VydmVyLiBcclxuICAgIC0gcmVnaXN0ZXIgd2F0Y2ggYWN0aW9uczogYWZmZWN0ZWQgZ3JvdXBzIHJlc3VsdCBpbiByZWxvYWRpbmcgb2Ygc2VydmVyICYvb3IgYnJvd3Nlci5cclxuKi9cclxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbih7IGFwaSAvKiBzdXBwbGllZCBieSBzY3JpcHRNYW5hZ2VyICovIH0gPSB7fSkge1xyXG4gIGNvbnN0IGFwcGxpY2F0aW9uUGF0aCA9IHBhdGguam9pbihhcGkucHJvamVjdC5jb25maWd1cmF0aW9uLnJvb3RQYXRoLCAnZW50cnlwb2ludC9jbGknKSxcclxuICAgIHJvb3RQYXRoID0gYXBpLnByb2plY3QuY29uZmlndXJhdGlvbi5yb290UGF0aFxyXG4gIGxldCByb290U2VydmljZUNvbmZpZyA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbj8uYXBpR2F0ZXdheT8uc2VydmljZS5maW5kKGl0ZW0gPT4gaXRlbS5zdWJkb21haW4gPT0gbnVsbCAvKlJvb3Qgc2VydmljZSovKVxyXG4gIGFzc2VydChyb290U2VydmljZUNvbmZpZywgYFJvb3Qgc2VydmljZSBtdXN0IGJlIGNvbmZpZ3VyZWQgaW4gdGhlIHByb2plY3RzIGFwaUdhdGV3YXkgY29uZmlndXJhdGlvbi5gKVxyXG4gIGxldCB0YXJnZXRTZXJ2aWNlSG9zdCA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbj8ucnVudGltZVZhcmlhYmxlPy5IT1NUXHJcbiAgYXNzZXJ0KHRhcmdldFNlcnZpY2VIb3N0LCBgSE9TVCBydW50aW1lIHZhcmlhYmxlIG11c3QgYmUgY29uZmlndXJlZCBpbiB0aGUgcHJvamVjdCdzIHJ1bnRpbWVWYXJpYWJsZSBjb25maWd1cmF0aW9uLmApXHJcbiAgbGV0IGNsaWVudFNpZGVQcm9qZWN0Q29uZmlnTGlzdCA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbj8uY2xpZW50U2lkZVByb2plY3RDb25maWdMaXN0XHJcbiAgYXNzZXJ0KGNsaWVudFNpZGVQcm9qZWN0Q29uZmlnTGlzdCwgYGNsaWVudFNpZGVQcm9qZWN0Q29uZmlnTGlzdCBtdXN0IGJlIGNvbmZpZ3VyZWQgaW4gdGhlIHByb2plY3QncyBjb25maWd1cmF0aW9uLmApXHJcblxyXG4gIC8vIEFwcGxpY2F0aW9uXHJcbiAgbGV0IG1hbmFnZVN1YnByb2Nlc3MgPSBuZXcgTWFuYWdlU3VicHJvY2Vzcyh7IGNsaUFkYXB0ZXJQYXRoOiBhcHBsaWNhdGlvblBhdGggfSlcclxuICBjb25zdCBydW5BcHBsaWNhdGlvbiA9IGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IGNsZWFyR3JhcGhEYXRhKCkgLy8gcnVuIHByZXJlcXVlc2l0ZSBjb250YWluZXIgYW5kIGNsZWFyIGdyYXBoXHJcbiAgICBtYW5hZ2VTdWJwcm9jZXNzLnJ1bkluU3VicHJvY2VzcygpXHJcbiAgfVxyXG5cclxuICAvLyBCcm93c2VyIGNvbnRyb2xcclxuICBsZXQgeyByZXN0YXJ0OiByZWxvYWRCcm93c2VyQ2xpZW50IH0gPSBhd2FpdCBicm93c2VyTGl2ZXJlbG9hZCh7XHJcbiAgICB0YXJnZXRQcm9qZWN0OiBhcGkucHJvamVjdCAvKmFkYXB0ZXIgZm9yIHdvcmtpbmcgd2l0aCB0YXJnZXQgZnVuY3Rpb24gaW50ZXJmYWNlLiovLFxyXG4gICAgcm9vdFNlcnZpY2VQb3J0OiByb290U2VydmljZUNvbmZpZy5wb3J0LFxyXG4gICAgcm9vdFNlcnZpY2VIb3N0OiB0YXJnZXRTZXJ2aWNlSG9zdCxcclxuICB9KVxyXG5cclxuICBtYW5hZ2VTdWJwcm9jZXNzLm9uKCdyZWFkeScsICgpID0+IHJlbG9hZEJyb3dzZXJDbGllbnQoKSkgLy8gcmVsb2FkIGJyb3dzZXIgYWZ0ZXIgc2VydmVyIHJlbG9hZFxyXG4gIGF3YWl0IHJ1bkFwcGxpY2F0aW9uKClcclxuXHJcbiAge1xyXG4gICAgbGV0IHNlcnZlclNpZGVMaXN0ID0gYXdhaXQgZmluZEZpbGVCeUdsb2JQYXR0ZXJuKHtcclxuICAgICAgYmFzZVBhdGg6IHJvb3RQYXRoLFxyXG4gICAgICBwYXR0ZXJuR2xvYjogW2AqKi8qLmpzYF0sXHJcbiAgICAgIGlnbm9yZTogW2AqKi97dGVtcG9yYXJ5LyoqLyosZGlzdHJpYnV0aW9uLyoqLyosLmdpdC8qKi8qLG5vZGVfbW9kdWxlcy8qKi8qfWBdLm1hcChpdGVtID0+IHBhdGguam9pbihyb290UGF0aCwgaXRlbSkgLypyZWxhdGVkIG9ubHkgbmVzdGVkIHBhdGhzKi8pLFxyXG4gICAgfSlcclxuXHJcbiAgICBhd2FpdCB3YXRjaEZpbGUoe1xyXG4gICAgICAvLyB0byBiZSBydW4gYWZ0ZXIgZmlsZSBub3RpZmljYXRpb25cclxuICAgICAgdHJpZ2dlckNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgYXdhaXQgcnVuQXBwbGljYXRpb24oKVxyXG4gICAgICB9LFxyXG4gICAgICBmaWxlQXJyYXk6IFsuLi5zZXJ2ZXJTaWRlTGlzdF0sXHJcbiAgICAgIGlnbm9yZU5vZGVNb2R1bGVzOiBmYWxzZSxcclxuICAgICAgbG9nTWVzc2FnZTogdHJ1ZSxcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB7XHJcbiAgICBsZXQgY2xpZW50U2lkZUxpc3QgPSBbXVxyXG4gICAgZm9yIChsZXQgeyBwYXRoOiBjbGllbnRTaWRlQmFzZVBhdGggfSBvZiBjbGllbnRTaWRlUHJvamVjdENvbmZpZ0xpc3QpXHJcbiAgICAgIGNsaWVudFNpZGVMaXN0ID0gW1xyXG4gICAgICAgIC4uLmNsaWVudFNpZGVMaXN0LFxyXG4gICAgICAgIC4uLihhd2FpdCBmaW5kRmlsZUJ5R2xvYlBhdHRlcm4oe1xyXG4gICAgICAgICAgYmFzZVBhdGg6IGNsaWVudFNpZGVCYXNlUGF0aCxcclxuICAgICAgICAgIHBhdHRlcm5HbG9iOiBbJyoqLyouanMnLCAnKiovKi5jc3MnLCAnKiovKi5odG1sJ10sXHJcbiAgICAgICAgICBpZ25vcmU6IFtgKiove0BwYWNrYWdlKi8qKi8qLHRlbXBvcmFyeS8qKi8qLGRpc3RyaWJ1dGlvbi8qKi8qLC5naXQvKiovKixub2RlX21vZHVsZXMvKiovKn1gXS5tYXAoaXRlbSA9PiBwYXRoLmpvaW4oY2xpZW50U2lkZUJhc2VQYXRoLCBpdGVtKSAvKnJlbGF0ZWQgb25seSBuZXN0ZWQgcGF0aHMqLyksXHJcbiAgICAgICAgfSkpLFxyXG4gICAgICBdXHJcblxyXG4gICAgYXdhaXQgd2F0Y2hGaWxlKHtcclxuICAgICAgLy8gdG8gYmUgcnVuIGFmdGVyIGZpbGUgbm90aWZpY2F0aW9uXHJcbiAgICAgIHRyaWdnZXJDYWxsYmFjazogKCkgPT4gcmVsb2FkQnJvd3NlckNsaWVudCgpLCAvLyByZWxvYWQgYnJvd3NlcnNcclxuICAgICAgZmlsZUFycmF5OiBbLi4uY2xpZW50U2lkZUxpc3RdLFxyXG4gICAgICBpZ25vcmVOb2RlTW9kdWxlczogZmFsc2UsXHJcbiAgICAgIGxvZ01lc3NhZ2U6IHRydWUsXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG4iXX0=