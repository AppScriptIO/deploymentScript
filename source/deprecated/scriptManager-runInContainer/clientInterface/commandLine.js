"use strict";




const path = require('path');
const assert = require('assert');
const resolve = require('resolve');
const slash = require('slash');
const moduleRootPath = `${__dirname}/../../../`;
const { runscriptManagerInContainerWithClientApp } = require(moduleRootPath);
const { parseKeyValuePairSeparatedBySymbolFromArray, combineKeyValueObjectIntoString } = require('@dependency/parseKeyValuePairSeparatedBySymbol');
const ownConfig = require(path.join(moduleRootPath, 'configuration/configuration.js'));
const { configurationFileLookup } = require(`@dependency/configurationManagement`);

const message_prefix = `\x1b[3m\x1b[2m•[${path.basename(__filename)} JS script]:\x1b[0m`;
console.group(`%s \x1b[33m%s\x1b[0m`, `${message_prefix}`, `ƒ container manager - container with volumes & requested entrypoint script`);

cliInterface();






function cliInterface() {

  const currentDirectory = path.normalize(process.cwd()),
  namedArgs = parseKeyValuePairSeparatedBySymbolFromArray({ array: process.argv }),
  scriptPath = path.normalize(process.argv[1]);

  let { configuration: applicationConfig, path: configurationPath } = configurationFileLookup({
    configurationPath: namedArgs.configuration,
    currentDirectory,
    configurationBasePath: ownConfig.targetApp.configurationBasePath });



  let relativeScriptFromPWDPath = path.relative(currentDirectory, scriptPath),
  nodeModulesPartialPath = ['node_modules'].concat(relativeScriptFromPWDPath.split('node_modules').slice(1)).join(''),
  nodeModulesParentPartialPath = relativeScriptFromPWDPath.split('node_modules').shift(),
  nodeModulesParentPath = path.join(currentDirectory, nodeModulesParentPartialPath);

  const scriptManagerHostRelativePath = path.dirname(resolve.sync('@dependency/appDeploymentManager/package.json', { preserveSymlinks: true, basedir: nodeModulesParentPath }));


  console.log(`Project root path: ${applicationConfig.directory.application.hostAbsolutePath}`);
  runscriptManagerInContainerWithClientApp({
    configurationAbsoluteHostPath: configurationPath,
    application: {
      hostPath: applicationConfig.directory.application.hostAbsolutePath,
      configuration: applicationConfig },

    scriptManager: {
      hostRelativePath: scriptManagerHostRelativePath },

    invokedDirectly: require.main === module ? true : false });

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NvdXJjZS9kZXByZWNhdGVkL3NjcmlwdE1hbmFnZXItcnVuSW5Db250YWluZXIvY2xpZW50SW50ZXJmYWNlL2NvbW1hbmRMaW5lLmpzIl0sIm5hbWVzIjpbInBhdGgiLCJyZXF1aXJlIiwiYXNzZXJ0IiwicmVzb2x2ZSIsInNsYXNoIiwibW9kdWxlUm9vdFBhdGgiLCJfX2Rpcm5hbWUiLCJydW5zY3JpcHRNYW5hZ2VySW5Db250YWluZXJXaXRoQ2xpZW50QXBwIiwicGFyc2VLZXlWYWx1ZVBhaXJTZXBhcmF0ZWRCeVN5bWJvbEZyb21BcnJheSIsImNvbWJpbmVLZXlWYWx1ZU9iamVjdEludG9TdHJpbmciLCJvd25Db25maWciLCJqb2luIiwiY29uZmlndXJhdGlvbkZpbGVMb29rdXAiLCJtZXNzYWdlX3ByZWZpeCIsImJhc2VuYW1lIiwiX19maWxlbmFtZSIsImNvbnNvbGUiLCJncm91cCIsImNsaUludGVyZmFjZSIsImN1cnJlbnREaXJlY3RvcnkiLCJub3JtYWxpemUiLCJwcm9jZXNzIiwiY3dkIiwibmFtZWRBcmdzIiwiYXJyYXkiLCJhcmd2Iiwic2NyaXB0UGF0aCIsImNvbmZpZ3VyYXRpb24iLCJhcHBsaWNhdGlvbkNvbmZpZyIsImNvbmZpZ3VyYXRpb25QYXRoIiwiY29uZmlndXJhdGlvbkJhc2VQYXRoIiwidGFyZ2V0QXBwIiwicmVsYXRpdmVTY3JpcHRGcm9tUFdEUGF0aCIsInJlbGF0aXZlIiwibm9kZU1vZHVsZXNQYXJ0aWFsUGF0aCIsImNvbmNhdCIsInNwbGl0Iiwic2xpY2UiLCJub2RlTW9kdWxlc1BhcmVudFBhcnRpYWxQYXRoIiwic2hpZnQiLCJub2RlTW9kdWxlc1BhcmVudFBhdGgiLCJzY3JpcHRNYW5hZ2VySG9zdFJlbGF0aXZlUGF0aCIsImRpcm5hbWUiLCJzeW5jIiwicHJlc2VydmVTeW1saW5rcyIsImJhc2VkaXIiLCJsb2ciLCJkaXJlY3RvcnkiLCJhcHBsaWNhdGlvbiIsImhvc3RBYnNvbHV0ZVBhdGgiLCJjb25maWd1cmF0aW9uQWJzb2x1dGVIb3N0UGF0aCIsImhvc3RQYXRoIiwic2NyaXB0TWFuYWdlciIsImhvc3RSZWxhdGl2ZVBhdGgiLCJpbnZva2VkRGlyZWN0bHkiLCJtYWluIiwibW9kdWxlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUtBLE1BQU1BLElBQUksR0FBR0MsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7QUFDQSxNQUFNQyxNQUFNLEdBQUdELE9BQU8sQ0FBQyxRQUFELENBQXRCO0FBQ0EsTUFBTUUsT0FBTyxHQUFHRixPQUFPLENBQUMsU0FBRCxDQUF2QjtBQUNBLE1BQU1HLEtBQUssR0FBR0gsT0FBTyxDQUFDLE9BQUQsQ0FBckI7QUFDQSxNQUFNSSxjQUFjLEdBQUksR0FBRUMsU0FBVSxZQUFwQztBQUNBLE1BQU0sRUFBRUMsd0NBQUYsS0FBK0NOLE9BQU8sQ0FBQ0ksY0FBRCxDQUE1RDtBQUNBLE1BQU0sRUFBRUcsMkNBQUYsRUFBK0NDLCtCQUEvQyxLQUFtRlIsT0FBTyxDQUFDLGdEQUFELENBQWhHO0FBQ0EsTUFBTVMsU0FBUyxHQUFHVCxPQUFPLENBQUNELElBQUksQ0FBQ1csSUFBTCxDQUFVTixjQUFWLEVBQTBCLGdDQUExQixDQUFELENBQXpCO0FBQ0EsTUFBTSxFQUFFTyx1QkFBRixLQUE4QlgsT0FBTyxDQUFFLHFDQUFGLENBQTNDOztBQUVBLE1BQU1ZLGNBQWMsR0FBSSxtQkFBa0JiLElBQUksQ0FBQ2MsUUFBTCxDQUFjQyxVQUFkLENBQTBCLHFCQUFwRTtBQUNBQyxPQUFPLENBQUNDLEtBQVIsQ0FBZSxzQkFBZixFQUF1QyxHQUFFSixjQUFlLEVBQXhELEVBQTRELDRFQUE1RDs7QUFFQUssWUFBWTs7Ozs7OztBQU9aLFNBQVNBLFlBQVQsR0FBd0I7O0FBRXRCLFFBQU1DLGdCQUFnQixHQUFHbkIsSUFBSSxDQUFDb0IsU0FBTCxDQUFlQyxPQUFPLENBQUNDLEdBQVIsRUFBZixDQUF6QjtBQUNFQyxFQUFBQSxTQUFTLEdBQUdmLDJDQUEyQyxDQUFDLEVBQUVnQixLQUFLLEVBQUVILE9BQU8sQ0FBQ0ksSUFBakIsRUFBRCxDQUR6RDtBQUVFQyxFQUFBQSxVQUFVLEdBQUcxQixJQUFJLENBQUNvQixTQUFMLENBQWVDLE9BQU8sQ0FBQ0ksSUFBUixDQUFhLENBQWIsQ0FBZixDQUZmOztBQUlBLE1BQUksRUFBRUUsYUFBYSxFQUFFQyxpQkFBakIsRUFBb0M1QixJQUFJLEVBQUU2QixpQkFBMUMsS0FBZ0VqQix1QkFBdUIsQ0FBQztBQUMxRmlCLElBQUFBLGlCQUFpQixFQUFFTixTQUFTLENBQUNJLGFBRDZEO0FBRTFGUixJQUFBQSxnQkFGMEY7QUFHMUZXLElBQUFBLHFCQUFxQixFQUFFcEIsU0FBUyxDQUFDcUIsU0FBVixDQUFvQkQscUJBSCtDLEVBQUQsQ0FBM0Y7Ozs7QUFPQSxNQUFJRSx5QkFBeUIsR0FBR2hDLElBQUksQ0FBQ2lDLFFBQUwsQ0FBY2QsZ0JBQWQsRUFBZ0NPLFVBQWhDLENBQWhDO0FBQ0VRLEVBQUFBLHNCQUFzQixHQUFHLENBQUMsY0FBRCxFQUFpQkMsTUFBakIsQ0FBd0JILHlCQUF5QixDQUFDSSxLQUExQixDQUFnQyxjQUFoQyxFQUFnREMsS0FBaEQsQ0FBc0QsQ0FBdEQsQ0FBeEIsRUFBa0YxQixJQUFsRixDQUF1RixFQUF2RixDQUQzQjtBQUVFMkIsRUFBQUEsNEJBQTRCLEdBQUdOLHlCQUF5QixDQUFDSSxLQUExQixDQUFnQyxjQUFoQyxFQUFnREcsS0FBaEQsRUFGakM7QUFHRUMsRUFBQUEscUJBQXFCLEdBQUd4QyxJQUFJLENBQUNXLElBQUwsQ0FBVVEsZ0JBQVYsRUFBNEJtQiw0QkFBNUIsQ0FIMUI7O0FBS0EsUUFBTUcsNkJBQTZCLEdBQUd6QyxJQUFJLENBQUMwQyxPQUFMLENBQWF2QyxPQUFPLENBQUN3QyxJQUFSLENBQWEsK0NBQWIsRUFBOEQsRUFBRUMsZ0JBQWdCLEVBQUUsSUFBcEIsRUFBMEJDLE9BQU8sRUFBRUwscUJBQW5DLEVBQTlELENBQWIsQ0FBdEM7OztBQUdBeEIsRUFBQUEsT0FBTyxDQUFDOEIsR0FBUixDQUFhLHNCQUFxQmxCLGlCQUFpQixDQUFDbUIsU0FBbEIsQ0FBNEJDLFdBQTVCLENBQXdDQyxnQkFBaUIsRUFBM0Y7QUFDQTFDLEVBQUFBLHdDQUF3QyxDQUFDO0FBQ3ZDMkMsSUFBQUEsNkJBQTZCLEVBQUVyQixpQkFEUTtBQUV2Q21CLElBQUFBLFdBQVcsRUFBRTtBQUNYRyxNQUFBQSxRQUFRLEVBQUV2QixpQkFBaUIsQ0FBQ21CLFNBQWxCLENBQTRCQyxXQUE1QixDQUF3Q0MsZ0JBRHZDO0FBRVh0QixNQUFBQSxhQUFhLEVBQUVDLGlCQUZKLEVBRjBCOztBQU12Q3dCLElBQUFBLGFBQWEsRUFBRTtBQUNiQyxNQUFBQSxnQkFBZ0IsRUFBRVosNkJBREwsRUFOd0I7O0FBU3ZDYSxJQUFBQSxlQUFlLEVBQUVyRCxPQUFPLENBQUNzRCxJQUFSLEtBQWlCQyxNQUFqQixHQUEwQixJQUExQixHQUFpQyxLQVRYLEVBQUQsQ0FBeEM7O0FBV0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqICBydW4gY29udGFpbmVyIG1hbmFnZXIgd2l0aCByZXF1ZXN0ZWQgY29tbWFuZC5cbiAqICAuL3NldHVwL25vZGVfbW9kdWxlcy8uYmluL2NvbnRhaW5lck1hbmFnZXIgY29uZmlndXJhdGlvbj0uL3NldHVwL2NvbmZpZ3VyYXRpb24vY29uZmlndXJhdGlvbi5qcyBlbnRyeXBvaW50Q29uZmlndXJhdGlvbktleT10ZXN0XG4gKiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKVxuY29uc3QgcmVzb2x2ZSA9IHJlcXVpcmUoJ3Jlc29sdmUnKVxuY29uc3Qgc2xhc2ggPSByZXF1aXJlKCdzbGFzaCcpIC8vIGNvbnZlcnQgYmFja3dhcmQgV2luZG93cyBzbGFzaCB0byBVbml4L1dpbmRvd3Mgc3VwcG9ydGVkIGZvcndhcmQgc2xhc2guXG5jb25zdCBtb2R1bGVSb290UGF0aCA9IGAke19fZGlybmFtZX0vLi4vLi4vLi4vYFxuY29uc3QgeyBydW5zY3JpcHRNYW5hZ2VySW5Db250YWluZXJXaXRoQ2xpZW50QXBwIH0gPSByZXF1aXJlKG1vZHVsZVJvb3RQYXRoKVxuY29uc3QgeyBwYXJzZUtleVZhbHVlUGFpclNlcGFyYXRlZEJ5U3ltYm9sRnJvbUFycmF5LCBjb21iaW5lS2V5VmFsdWVPYmplY3RJbnRvU3RyaW5nIH0gPSByZXF1aXJlKCdAZGVwZW5kZW5jeS9wYXJzZUtleVZhbHVlUGFpclNlcGFyYXRlZEJ5U3ltYm9sJylcbmNvbnN0IG93bkNvbmZpZyA9IHJlcXVpcmUocGF0aC5qb2luKG1vZHVsZVJvb3RQYXRoLCAnY29uZmlndXJhdGlvbi9jb25maWd1cmF0aW9uLmpzJykpIC8vIGNvbnRhaW5lciBtYW5hZ2VyIGNvbmZpZyBwYXRoXG5jb25zdCB7IGNvbmZpZ3VyYXRpb25GaWxlTG9va3VwIH0gPSByZXF1aXJlKGBAZGVwZW5kZW5jeS9jb25maWd1cmF0aW9uTWFuYWdlbWVudGApXG5cbmNvbnN0IG1lc3NhZ2VfcHJlZml4ID0gYFxceDFiWzNtXFx4MWJbMm3igKJbJHtwYXRoLmJhc2VuYW1lKF9fZmlsZW5hbWUpfSBKUyBzY3JpcHRdOlxceDFiWzBtYFxuY29uc29sZS5ncm91cChgJXMgXFx4MWJbMzNtJXNcXHgxYlswbWAsIGAke21lc3NhZ2VfcHJlZml4fWAsIGDGkiBjb250YWluZXIgbWFuYWdlciAtIGNvbnRhaW5lciB3aXRoIHZvbHVtZXMgJiByZXF1ZXN0ZWQgZW50cnlwb2ludCBzY3JpcHRgKVxuXG5jbGlJbnRlcmZhY2UoKVxuXG4vKipcbiAqIFVTQUdFOlxuICogIHNjcmlwdCBpbnZva2F0aW9uIGZyb20gc2hlbGwgdXNpbmc6IG5weCB8fCB5YXJuIHJ1biB8fCA8cGF0aFRvU2NyaXB0PiAoZS5nLiAuL3NldHVwL25vZGVfbW9kdWxlcy8uYmluL2NvbnRhaW5lck1hbmFnZXIuanMpXG4gKiAgU2hlbGw6IHlhcm4gcnVuIGNsaUFkYXB0ZXIgY29uZmlndXJhdGlvbj08cmVsYXRpdmVQYXRoVG9Db25maWd1cmF0aW9uRnJvbVBXRD4gPGZpbGVuYW1lPlxuICovXG5mdW5jdGlvbiBjbGlJbnRlcmZhY2UoKSB7XG4gIC8qKiBQYXJzZSBhcmd1bWVudHMgYW5kIGluaXRpYWxpemUgcGFyYW1ldGVycyAqL1xuICBjb25zdCBjdXJyZW50RGlyZWN0b3J5ID0gcGF0aC5ub3JtYWxpemUocHJvY2Vzcy5jd2QoKSksIC8vIGdldCBjdXJyZW50IGRpcmVjdG9yeVxuICAgIG5hbWVkQXJncyA9IHBhcnNlS2V5VmFsdWVQYWlyU2VwYXJhdGVkQnlTeW1ib2xGcm9tQXJyYXkoeyBhcnJheTogcHJvY2Vzcy5hcmd2IH0pLCAvLyBbJ3g9eSddIC0tPiB7IHg6IHkgfVxuICAgIHNjcmlwdFBhdGggPSBwYXRoLm5vcm1hbGl6ZShwcm9jZXNzLmFyZ3ZbMV0pIC8vIHRoZSBzY3JpcHQgdGhhdCBzaG91bGQgYmUgZXhlY3V0ZWQgb24gdGhlIHRhcmdldCBhcHBsaWNhdGlvbi5cblxuICBsZXQgeyBjb25maWd1cmF0aW9uOiBhcHBsaWNhdGlvbkNvbmZpZywgcGF0aDogY29uZmlndXJhdGlvblBhdGggfSA9IGNvbmZpZ3VyYXRpb25GaWxlTG9va3VwKHtcbiAgICBjb25maWd1cmF0aW9uUGF0aDogbmFtZWRBcmdzLmNvbmZpZ3VyYXRpb24sXG4gICAgY3VycmVudERpcmVjdG9yeSxcbiAgICBjb25maWd1cmF0aW9uQmFzZVBhdGg6IG93bkNvbmZpZy50YXJnZXRBcHAuY29uZmlndXJhdGlvbkJhc2VQYXRoLFxuICB9KVxuXG4gIC8vIGdldCBzeW1saW5rIHBhdGhcbiAgbGV0IHJlbGF0aXZlU2NyaXB0RnJvbVBXRFBhdGggPSBwYXRoLnJlbGF0aXZlKGN1cnJlbnREaXJlY3RvcnksIHNjcmlwdFBhdGgpLFxuICAgIG5vZGVNb2R1bGVzUGFydGlhbFBhdGggPSBbJ25vZGVfbW9kdWxlcyddLmNvbmNhdChyZWxhdGl2ZVNjcmlwdEZyb21QV0RQYXRoLnNwbGl0KCdub2RlX21vZHVsZXMnKS5zbGljZSgxKSkuam9pbignJyksIC8vIGdldCBwYXRoIGVsZW1lbnRzIGFmdGVyIGZpcnN0IG5vZGVfbW9kdWxlcyBhcHBlYXJhbmNlIGkuZS4gL3gvbm9kZV9tb2R1bGVzL3kgLS0+IG5vZGVfbW9kdWxlcy95XG4gICAgbm9kZU1vZHVsZXNQYXJlbnRQYXJ0aWFsUGF0aCA9IHJlbGF0aXZlU2NyaXB0RnJvbVBXRFBhdGguc3BsaXQoJ25vZGVfbW9kdWxlcycpLnNoaWZ0KCksIC8vIC94L25vZGVfbW9kdWxlcy95IC0tPiAveC9cbiAgICBub2RlTW9kdWxlc1BhcmVudFBhdGggPSBwYXRoLmpvaW4oY3VycmVudERpcmVjdG9yeSwgbm9kZU1vZHVsZXNQYXJlbnRQYXJ0aWFsUGF0aClcblxuICBjb25zdCBzY3JpcHRNYW5hZ2VySG9zdFJlbGF0aXZlUGF0aCA9IHBhdGguZGlybmFtZShyZXNvbHZlLnN5bmMoJ0BkZXBlbmRlbmN5L2FwcERlcGxveW1lbnRNYW5hZ2VyL3BhY2thZ2UuanNvbicsIHsgcHJlc2VydmVTeW1saW5rczogdHJ1ZSwgYmFzZWRpcjogbm9kZU1vZHVsZXNQYXJlbnRQYXRoIH0pKSAvLyB1c2UgJ3Jlc29sdmUnIG1vZHVsZSB0byBhbGxvdyBwYXNzaW5nICdwcmVzZXJ2ZSBzeW1saW5rcycgb3B0aW9uIHRoYXQgaXMgbm90IHN1cHBvcnRlZCBieSByZXF1aXJlLnJlc29sdmUgbW9kdWxlLlxuXG4gIC8qKiBpbnZva2UgdGhlIGhlbHBlciBmb3Igc2NyaXB0IGV4ZWN1dGlvbiBpbiBjb250YWluZXIgICovXG4gIGNvbnNvbGUubG9nKGBQcm9qZWN0IHJvb3QgcGF0aDogJHthcHBsaWNhdGlvbkNvbmZpZy5kaXJlY3RvcnkuYXBwbGljYXRpb24uaG9zdEFic29sdXRlUGF0aH1gKVxuICBydW5zY3JpcHRNYW5hZ2VySW5Db250YWluZXJXaXRoQ2xpZW50QXBwKHtcbiAgICBjb25maWd1cmF0aW9uQWJzb2x1dGVIb3N0UGF0aDogY29uZmlndXJhdGlvblBhdGgsXG4gICAgYXBwbGljYXRpb246IHtcbiAgICAgIGhvc3RQYXRoOiBhcHBsaWNhdGlvbkNvbmZpZy5kaXJlY3RvcnkuYXBwbGljYXRpb24uaG9zdEFic29sdXRlUGF0aCxcbiAgICAgIGNvbmZpZ3VyYXRpb246IGFwcGxpY2F0aW9uQ29uZmlnLFxuICAgIH0sXG4gICAgc2NyaXB0TWFuYWdlcjoge1xuICAgICAgaG9zdFJlbGF0aXZlUGF0aDogc2NyaXB0TWFuYWdlckhvc3RSZWxhdGl2ZVBhdGgsXG4gICAgfSxcbiAgICBpbnZva2VkRGlyZWN0bHk6IHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlID8gdHJ1ZSA6IGZhbHNlLFxuICB9KVxufVxuIl19