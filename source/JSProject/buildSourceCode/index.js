"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.webappProject = webappProject;exports.moduleProject = moduleProject;

var _buildTool = require("@deployment/buildTool");


async function webappProject(...args) {var _args$;

  const { api } = args[0];
  args[0].targetProject = api.project;
  (_args$ = args[0]).entryNodeKey || (_args$.entryNodeKey = '58c15cc8-6f40-4d0b-815a-0b8594aeb972');
  args[0].taskContextName = 'webappProjectTask';
  await (0, _buildTool.build)(...args).catch(console.error);
}


async function moduleProject(...args) {var _args$2;

  const { api } = args[0];
  args[0].targetProject = api.project;
  (_args$2 = args[0]).entryNodeKey || (_args$2.entryNodeKey = '171d18f8-9d25-4483-aeb9-a29c9fbed6ac');
  args[0].taskContextName = 'moduleProjectTask';
  await (0, _buildTool.build)(...args).catch(console.error);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvYnVpbGRTb3VyY2VDb2RlL2luZGV4LmpzIl0sIm5hbWVzIjpbIndlYmFwcFByb2plY3QiLCJhcmdzIiwiYXBpIiwidGFyZ2V0UHJvamVjdCIsInByb2plY3QiLCJlbnRyeU5vZGVLZXkiLCJ0YXNrQ29udGV4dE5hbWUiLCJjYXRjaCIsImNvbnNvbGUiLCJlcnJvciIsIm1vZHVsZVByb2plY3QiXSwibWFwcGluZ3MiOiI7O0FBRUE7OztBQUdPLGVBQWVBLGFBQWYsQ0FBNkIsR0FBR0MsSUFBaEMsRUFBc0M7O0FBRTNDLFFBQU0sRUFBRUMsR0FBRixLQUEwQ0QsSUFBSSxDQUFDLENBQUQsQ0FBcEQ7QUFDQUEsRUFBQUEsSUFBSSxDQUFDLENBQUQsQ0FBSixDQUFRRSxhQUFSLEdBQXdCRCxHQUFHLENBQUNFLE9BQTVCO0FBQ0EsWUFBQUgsSUFBSSxDQUFDLENBQUQsQ0FBSixFQUFRSSxZQUFSLFlBQVFBLFlBQVIsR0FBeUIsc0NBQXpCO0FBQ0FKLEVBQUFBLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUUssZUFBUixHQUEwQixtQkFBMUI7QUFDQSxRQUFNLHNCQUFNLEdBQUdMLElBQVQsRUFBZU0sS0FBZixDQUFxQkMsT0FBTyxDQUFDQyxLQUE3QixDQUFOO0FBQ0Q7OztBQUdNLGVBQWVDLGFBQWYsQ0FBNkIsR0FBR1QsSUFBaEMsRUFBc0M7O0FBRTNDLFFBQU0sRUFBRUMsR0FBRixLQUEwQ0QsSUFBSSxDQUFDLENBQUQsQ0FBcEQ7QUFDQUEsRUFBQUEsSUFBSSxDQUFDLENBQUQsQ0FBSixDQUFRRSxhQUFSLEdBQXdCRCxHQUFHLENBQUNFLE9BQTVCO0FBQ0EsYUFBQUgsSUFBSSxDQUFDLENBQUQsQ0FBSixFQUFRSSxZQUFSLGFBQVFBLFlBQVIsR0FBeUIsc0NBQXpCO0FBQ0FKLEVBQUFBLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUUssZUFBUixHQUEwQixtQkFBMUI7QUFDQSxRQUFNLHNCQUFNLEdBQUdMLElBQVQsRUFBZU0sS0FBZixDQUFxQkMsT0FBTyxDQUFDQyxLQUE3QixDQUFOO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmlsZXN5c3RlbSBmcm9tICdmcydcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IHsgYnVpbGQgfSBmcm9tICdAZGVwbG95bWVudC9idWlsZFRvb2wnXHJcblxyXG4vLyBidWlsZCBwcm9jZXNzIGZvciB3ZWJhcHBzIHJlbHlpbmcgb24gYXBwc2NyaXB0IG1vZHVsZS5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdlYmFwcFByb2plY3QoLi4uYXJncykge1xyXG4gIC8vIGFkYXB0ZXIgZm9yIHdvcmtpbmcgd2l0aCB0YXJnZXQgZnVuY3Rpb24gaW50ZXJmYWNlIG9mIGBzY3JpcHRNYW5hZ2VyYC5cclxuICBjb25zdCB7IGFwaSAvKiBzdXBwbGllZCBieSBzY3JpcHRNYW5hZ2VyICovIH0gPSBhcmdzWzBdXHJcbiAgYXJnc1swXS50YXJnZXRQcm9qZWN0ID0gYXBpLnByb2plY3RcclxuICBhcmdzWzBdLmVudHJ5Tm9kZUtleSB8fD0gJzU4YzE1Y2M4LTZmNDAtNGQwYi04MTVhLTBiODU5NGFlYjk3MicgLy8gZ3JhcGggdGFza3MgdHJhdmVyc2FsIGVudHJ5cG9pbnRcclxuICBhcmdzWzBdLnRhc2tDb250ZXh0TmFtZSA9ICd3ZWJhcHBQcm9qZWN0VGFzaydcclxuICBhd2FpdCBidWlsZCguLi5hcmdzKS5jYXRjaChjb25zb2xlLmVycm9yKVxyXG59XHJcblxyXG4vLyBidWlsZCBwcm9jZXNzIGZvciBKYXZhc2NyaXB0IG1vZHVsZSByZXBvc2l0b3JpZXNcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1vZHVsZVByb2plY3QoLi4uYXJncykge1xyXG4gIC8vIGFkYXB0ZXIgZm9yIHdvcmtpbmcgd2l0aCB0YXJnZXQgZnVuY3Rpb24gaW50ZXJmYWNlIG9mIGBzY3JpcHRNYW5hZ2VyYC5cclxuICBjb25zdCB7IGFwaSAvKiBzdXBwbGllZCBieSBzY3JpcHRNYW5hZ2VyICovIH0gPSBhcmdzWzBdXHJcbiAgYXJnc1swXS50YXJnZXRQcm9qZWN0ID0gYXBpLnByb2plY3RcclxuICBhcmdzWzBdLmVudHJ5Tm9kZUtleSB8fD0gJzE3MWQxOGY4LTlkMjUtNDQ4My1hZWI5LWEyOWM5ZmJlZDZhYycgLy8gZ3JhcGggdGFza3MgdHJhdmVyc2FsIGVudHJ5cG9pbnRcclxuICBhcmdzWzBdLnRhc2tDb250ZXh0TmFtZSA9ICdtb2R1bGVQcm9qZWN0VGFzaydcclxuICBhd2FpdCBidWlsZCguLi5hcmdzKS5jYXRjaChjb25zb2xlLmVycm9yKVxyXG59XHJcbiJdfQ==