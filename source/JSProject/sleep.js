"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");var _path = _interopRequireDefault(require("path"));
var _child_process = require("child_process");

module.exports = {
  setInterval: function ({ interval = 1000 } = {}) {

    console.log(`Executing interval in ${__filename}. NodeJS version: ${JSON.stringify(process.versions)}`);
    setInterval(function () {
      console.info('Sleeping...');
    }, interval);
  },
  setTimeout: function ({ timeout = 10000 } = {}) {
    setTimeout(() => {
      console.log('setTimeout command ended. The process will exit now.');
    }, timeout);
  },
  inContainer({ ymlFile, serviceName, containerPrefix }) {
    let containerCommand = 'sleep 1000000';
    let processCommand = 'docker-compose';
    let processArg = [`-f ${ymlFile}`, `--project-name ${containerPrefix}`, `run --service-ports --use-aliases`, `--entrypoint '${containerCommand}'`, `${serviceName}`];
    (0, _child_process.spawnSync)(processCommand, processArg, { shell: true, stdio: [0, 1, 2] });
  },
  inContainer2() {
    const message_prefix = `\x1b[3m\x1b[2m•[${_path.default.basename(__filename)} JS script]:\x1b[0m`;

    console.group(`%s \x1b[33m%s\x1b[0m`, `${message_prefix}`, `ƒ sleep - container with volumes`);

    let image = 'node:latest',
    containerCommand = 'sleep 1000000',
    processCommand = 'docker',
    containerPrefix = 'sleepscriptManager',
    applicationHostPath = _path.default.normalize(_path.default.join(__dirname, '../'));

    let processArg = [
    `run`,

    `--volume ${applicationHostPath}:/project/application`,
    `--volume ${applicationHostPath}:/project/scriptManager`,
    `--env hostPath=${applicationHostPath}`,
    `--name ${containerPrefix}`,
    `${image}`,
    `${containerCommand}`];


    console.log(`%s \n %s \n %s`, `\x1b[3m\x1b[2m > ${processCommand} ${processArg.join(' ')}\x1b[0m`, `\t\x1b[3m\x1b[2mimage:\x1b[0m ${image}`, `\t\x1b[3m\x1b[2mcommand:\x1b[0m ${containerCommand}`);

    let cp = (0, _child_process.spawn)(processCommand, processArg, { detached: false, shell: true, stdio: [0, 1, 2] });
    cp.on('error', function (err) {
      throw err;
    });
    cp.unref();
    console.groupEnd();
  } };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3Qvc2xlZXAuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsInNldEludGVydmFsIiwiaW50ZXJ2YWwiLCJjb25zb2xlIiwibG9nIiwiX19maWxlbmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJwcm9jZXNzIiwidmVyc2lvbnMiLCJpbmZvIiwic2V0VGltZW91dCIsInRpbWVvdXQiLCJpbkNvbnRhaW5lciIsInltbEZpbGUiLCJzZXJ2aWNlTmFtZSIsImNvbnRhaW5lclByZWZpeCIsImNvbnRhaW5lckNvbW1hbmQiLCJwcm9jZXNzQ29tbWFuZCIsInByb2Nlc3NBcmciLCJzaGVsbCIsInN0ZGlvIiwiaW5Db250YWluZXIyIiwibWVzc2FnZV9wcmVmaXgiLCJwYXRoIiwiYmFzZW5hbWUiLCJncm91cCIsImltYWdlIiwiYXBwbGljYXRpb25Ib3N0UGF0aCIsIm5vcm1hbGl6ZSIsImpvaW4iLCJfX2Rpcm5hbWUiLCJjcCIsImRldGFjaGVkIiwib24iLCJlcnIiLCJ1bnJlZiIsImdyb3VwRW5kIl0sIm1hcHBpbmdzIjoia0dBQUE7QUFDQTs7QUFFQUEsTUFBTSxDQUFDQyxPQUFQLEdBQWlCO0FBQ2ZDLEVBQUFBLFdBQVcsRUFBRSxVQUFTLEVBQUVDLFFBQVEsR0FBRyxJQUFiLEtBQXNCLEVBQS9CLEVBQW1DOztBQUU5Q0MsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQWEseUJBQXdCQyxVQUFXLHFCQUFvQkMsSUFBSSxDQUFDQyxTQUFMLENBQWVDLE9BQU8sQ0FBQ0MsUUFBdkIsQ0FBaUMsRUFBckc7QUFDQVIsSUFBQUEsV0FBVyxDQUFDLFlBQVc7QUFDckJFLE1BQUFBLE9BQU8sQ0FBQ08sSUFBUixDQUFhLGFBQWI7QUFDRCxLQUZVLEVBRVJSLFFBRlEsQ0FBWDtBQUdELEdBUGM7QUFRZlMsRUFBQUEsVUFBVSxFQUFFLFVBQVMsRUFBRUMsT0FBTyxHQUFHLEtBQVosS0FBc0IsRUFBL0IsRUFBbUM7QUFDN0NELElBQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ2ZSLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHNEQUFaO0FBQ0QsS0FGUyxFQUVQUSxPQUZPLENBQVY7QUFHRCxHQVpjO0FBYWZDLEVBQUFBLFdBQVcsQ0FBQyxFQUFFQyxPQUFGLEVBQVdDLFdBQVgsRUFBd0JDLGVBQXhCLEVBQUQsRUFBNEM7QUFDckQsUUFBSUMsZ0JBQWdCLEdBQUcsZUFBdkI7QUFDQSxRQUFJQyxjQUFjLEdBQUcsZ0JBQXJCO0FBQ0EsUUFBSUMsVUFBVSxHQUFHLENBQUUsTUFBS0wsT0FBUSxFQUFmLEVBQW1CLGtCQUFpQkUsZUFBZ0IsRUFBcEQsRUFBd0QsbUNBQXhELEVBQTZGLGlCQUFnQkMsZ0JBQWlCLEdBQTlILEVBQW1JLEdBQUVGLFdBQVksRUFBakosQ0FBakI7QUFDQSxrQ0FBVUcsY0FBVixFQUEwQkMsVUFBMUIsRUFBc0MsRUFBRUMsS0FBSyxFQUFFLElBQVQsRUFBZUMsS0FBSyxFQUFFLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQXRCLEVBQXRDO0FBQ0QsR0FsQmM7QUFtQmZDLEVBQUFBLFlBQVksR0FBRztBQUNiLFVBQU1DLGNBQWMsR0FBSSxtQkFBa0JDLGNBQUtDLFFBQUwsQ0FBY3BCLFVBQWQsQ0FBMEIscUJBQXBFOztBQUVBRixJQUFBQSxPQUFPLENBQUN1QixLQUFSLENBQWUsc0JBQWYsRUFBdUMsR0FBRUgsY0FBZSxFQUF4RCxFQUE0RCxrQ0FBNUQ7O0FBRUEsUUFBSUksS0FBSyxHQUFHLGFBQVo7QUFDRVYsSUFBQUEsZ0JBQWdCLEdBQUcsZUFEckI7QUFFRUMsSUFBQUEsY0FBYyxHQUFHLFFBRm5CO0FBR0VGLElBQUFBLGVBQWUsR0FBRyxvQkFIcEI7QUFJRVksSUFBQUEsbUJBQW1CLEdBQUdKLGNBQUtLLFNBQUwsQ0FBZUwsY0FBS00sSUFBTCxDQUFVQyxTQUFWLEVBQXFCLEtBQXJCLENBQWYsQ0FKeEI7O0FBTUEsUUFBSVosVUFBVSxHQUFHO0FBQ2QsU0FEYzs7QUFHZCxnQkFBV1MsbUJBQW9CLHVCQUhqQjtBQUlkLGdCQUFXQSxtQkFBb0IseUJBSmpCO0FBS2Qsc0JBQWlCQSxtQkFBb0IsRUFMdkI7QUFNZCxjQUFTWixlQUFnQixFQU5YO0FBT2QsT0FBRVcsS0FBTSxFQVBNO0FBUWQsT0FBRVYsZ0JBQWlCLEVBUkwsQ0FBakI7OztBQVdBZCxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBYSxnQkFBYixFQUErQixvQkFBbUJjLGNBQWUsSUFBR0MsVUFBVSxDQUFDVyxJQUFYLENBQWdCLEdBQWhCLENBQXFCLFNBQXpGLEVBQW9HLGlDQUFnQ0gsS0FBTSxFQUExSSxFQUE4SSxtQ0FBa0NWLGdCQUFpQixFQUFqTTs7QUFFQSxRQUFJZSxFQUFFLEdBQUcsMEJBQU1kLGNBQU4sRUFBc0JDLFVBQXRCLEVBQWtDLEVBQUVjLFFBQVEsRUFBRSxLQUFaLEVBQW1CYixLQUFLLEVBQUUsSUFBMUIsRUFBZ0NDLEtBQUssRUFBRSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUF2QyxFQUFsQyxDQUFUO0FBQ0FXLElBQUFBLEVBQUUsQ0FBQ0UsRUFBSCxDQUFNLE9BQU4sRUFBZSxVQUFTQyxHQUFULEVBQWM7QUFDM0IsWUFBTUEsR0FBTjtBQUNELEtBRkQ7QUFHQUgsSUFBQUEsRUFBRSxDQUFDSSxLQUFIO0FBQ0FqQyxJQUFBQSxPQUFPLENBQUNrQyxRQUFSO0FBQ0QsR0FqRGMsRUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgeyBzcGF3biwgc3Bhd25TeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2VzcydcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHNldEludGVydmFsOiBmdW5jdGlvbih7IGludGVydmFsID0gMTAwMCB9ID0ge30pIHtcclxuICAgIC8vIChmdW5jdGlvbiBlbmRsZXNzUHJvY2VzcygpIHsgcHJvY2Vzcy5uZXh0VGljayhlbmRsZXNzUHJvY2VzcykgfSkoKSAvLyBSZWFkYWJsZSBzb2x1dGlvbiBidXQgaXQgdXRpbGl6ZXMgYWxsIGF2YWlsYWJsZSBDUFUuIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM5MDgyNTI3L2hvdy10by1wcmV2ZW50LXRoZS1ub2RlanMtZXZlbnQtbG9vcC1mcm9tLWV4aXRpbmdcclxuICAgIGNvbnNvbGUubG9nKGBFeGVjdXRpbmcgaW50ZXJ2YWwgaW4gJHtfX2ZpbGVuYW1lfS4gTm9kZUpTIHZlcnNpb246ICR7SlNPTi5zdHJpbmdpZnkocHJvY2Vzcy52ZXJzaW9ucyl9YClcclxuICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICBjb25zb2xlLmluZm8oJ1NsZWVwaW5nLi4uJylcclxuICAgIH0sIGludGVydmFsKVxyXG4gIH0sXHJcbiAgc2V0VGltZW91dDogZnVuY3Rpb24oeyB0aW1lb3V0ID0gMTAwMDAgfSA9IHt9KSB7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ3NldFRpbWVvdXQgY29tbWFuZCBlbmRlZC4gVGhlIHByb2Nlc3Mgd2lsbCBleGl0IG5vdy4nKVxyXG4gICAgfSwgdGltZW91dClcclxuICB9LFxyXG4gIGluQ29udGFpbmVyKHsgeW1sRmlsZSwgc2VydmljZU5hbWUsIGNvbnRhaW5lclByZWZpeCB9KSB7XHJcbiAgICBsZXQgY29udGFpbmVyQ29tbWFuZCA9ICdzbGVlcCAxMDAwMDAwJ1xyXG4gICAgbGV0IHByb2Nlc3NDb21tYW5kID0gJ2RvY2tlci1jb21wb3NlJ1xyXG4gICAgbGV0IHByb2Nlc3NBcmcgPSBbYC1mICR7eW1sRmlsZX1gLCBgLS1wcm9qZWN0LW5hbWUgJHtjb250YWluZXJQcmVmaXh9YCwgYHJ1biAtLXNlcnZpY2UtcG9ydHMgLS11c2UtYWxpYXNlc2AsIGAtLWVudHJ5cG9pbnQgJyR7Y29udGFpbmVyQ29tbWFuZH0nYCwgYCR7c2VydmljZU5hbWV9YF1cclxuICAgIHNwYXduU3luYyhwcm9jZXNzQ29tbWFuZCwgcHJvY2Vzc0FyZywgeyBzaGVsbDogdHJ1ZSwgc3RkaW86IFswLCAxLCAyXSB9KVxyXG4gIH0sXHJcbiAgaW5Db250YWluZXIyKCkge1xyXG4gICAgY29uc3QgbWVzc2FnZV9wcmVmaXggPSBgXFx4MWJbM21cXHgxYlsybeKAolske3BhdGguYmFzZW5hbWUoX19maWxlbmFtZSl9IEpTIHNjcmlwdF06XFx4MWJbMG1gXHJcblxyXG4gICAgY29uc29sZS5ncm91cChgJXMgXFx4MWJbMzNtJXNcXHgxYlswbWAsIGAke21lc3NhZ2VfcHJlZml4fWAsIGDGkiBzbGVlcCAtIGNvbnRhaW5lciB3aXRoIHZvbHVtZXNgKVxyXG5cclxuICAgIGxldCBpbWFnZSA9ICdub2RlOmxhdGVzdCcsXHJcbiAgICAgIGNvbnRhaW5lckNvbW1hbmQgPSAnc2xlZXAgMTAwMDAwMCcsXHJcbiAgICAgIHByb2Nlc3NDb21tYW5kID0gJ2RvY2tlcicsXHJcbiAgICAgIGNvbnRhaW5lclByZWZpeCA9ICdzbGVlcHNjcmlwdE1hbmFnZXInLFxyXG4gICAgICBhcHBsaWNhdGlvbkhvc3RQYXRoID0gcGF0aC5ub3JtYWxpemUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLycpKVxyXG5cclxuICAgIGxldCBwcm9jZXNzQXJnID0gW1xyXG4gICAgICBgcnVuYCxcclxuICAgICAgLy8gYC0tdm9sdW1lIC92YXIvcnVuL2RvY2tlci5zb2NrOi92YXIvcnVuL2RvY2tlci5zb2NrYCxcclxuICAgICAgYC0tdm9sdW1lICR7YXBwbGljYXRpb25Ib3N0UGF0aH06L3Byb2plY3QvYXBwbGljYXRpb25gLFxyXG4gICAgICBgLS12b2x1bWUgJHthcHBsaWNhdGlvbkhvc3RQYXRofTovcHJvamVjdC9zY3JpcHRNYW5hZ2VyYCxcclxuICAgICAgYC0tZW52IGhvc3RQYXRoPSR7YXBwbGljYXRpb25Ib3N0UGF0aH1gLFxyXG4gICAgICBgLS1uYW1lICR7Y29udGFpbmVyUHJlZml4fWAsXHJcbiAgICAgIGAke2ltYWdlfWAsXHJcbiAgICAgIGAke2NvbnRhaW5lckNvbW1hbmR9YCxcclxuICAgIF1cclxuXHJcbiAgICBjb25zb2xlLmxvZyhgJXMgXFxuICVzIFxcbiAlc2AsIGBcXHgxYlszbVxceDFiWzJtID4gJHtwcm9jZXNzQ29tbWFuZH0gJHtwcm9jZXNzQXJnLmpvaW4oJyAnKX1cXHgxYlswbWAsIGBcXHRcXHgxYlszbVxceDFiWzJtaW1hZ2U6XFx4MWJbMG0gJHtpbWFnZX1gLCBgXFx0XFx4MWJbM21cXHgxYlsybWNvbW1hbmQ6XFx4MWJbMG0gJHtjb250YWluZXJDb21tYW5kfWApXHJcblxyXG4gICAgbGV0IGNwID0gc3Bhd24ocHJvY2Vzc0NvbW1hbmQsIHByb2Nlc3NBcmcsIHsgZGV0YWNoZWQ6IGZhbHNlLCBzaGVsbDogdHJ1ZSwgc3RkaW86IFswLCAxLCAyXSB9KVxyXG4gICAgY3Aub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgIHRocm93IGVyclxyXG4gICAgfSlcclxuICAgIGNwLnVucmVmKCkgLy8gcHJldmVudCBwYXJlbnQgZnJvbSB3YWl0aW5nIHRvIGNoaWxkIHByb2Nlc3MgYW5kIHVuIHJlZmVyZW5jZSBjaGlsZCBmcm9tIHBhcmVudCdzIGV2ZW50IGxvb3AuXHJcbiAgICBjb25zb2xlLmdyb3VwRW5kKClcclxuICB9LFxyXG59XHJcbiJdfQ==