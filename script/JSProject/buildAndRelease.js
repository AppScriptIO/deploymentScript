"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.moduleProject = moduleProject;exports.webappProject = webappProject;var _release = require("./release");
var _buildSourceCode = require("./buildSourceCode");
var _packageVersion = require("./packageVersion");

async function moduleProject({ api, tagName }) {
  let version = await (0, _packageVersion.bumpVersion)({ api });
  await (0, _release.createGithubBranchedRelease)({
    api,
    tagName: version,
    buildCallback: () => (0, _buildSourceCode.moduleProject)({ api }) });

}

async function webappProject({ api, tagName }) {
  let version = await (0, _packageVersion.bumpVersion)({ api });
  await (0, _release.createGithubBranchedRelease)({
    api,
    tagName: version,
    buildCallback: () => (0, _buildSourceCode.webappProject)({ api }) });

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NjcmlwdC9KU1Byb2plY3QvYnVpbGRBbmRSZWxlYXNlLmpzIl0sIm5hbWVzIjpbIm1vZHVsZVByb2plY3QiLCJhcGkiLCJ0YWdOYW1lIiwidmVyc2lvbiIsImJ1aWxkQ2FsbGJhY2siLCJ3ZWJhcHBQcm9qZWN0Il0sIm1hcHBpbmdzIjoidUpBQUE7QUFDQTtBQUNBOztBQUVPLGVBQWVBLGFBQWYsQ0FBNkIsRUFBRUMsR0FBRixFQUFPQyxPQUFQLEVBQTdCLEVBQStDO0FBQ3BELE1BQUlDLE9BQU8sR0FBRyxNQUFNLGlDQUFZLEVBQUVGLEdBQUYsRUFBWixDQUFwQjtBQUNBLFFBQU0sMENBQTRCO0FBQ2hDQSxJQUFBQSxHQURnQztBQUVoQ0MsSUFBQUEsT0FBTyxFQUFFQyxPQUZ1QjtBQUdoQ0MsSUFBQUEsYUFBYSxFQUFFLE1BQU0sb0NBQW1CLEVBQUVILEdBQUYsRUFBbkIsQ0FIVyxFQUE1QixDQUFOOztBQUtEOztBQUVNLGVBQWVJLGFBQWYsQ0FBNkIsRUFBRUosR0FBRixFQUFPQyxPQUFQLEVBQTdCLEVBQStDO0FBQ3BELE1BQUlDLE9BQU8sR0FBRyxNQUFNLGlDQUFZLEVBQUVGLEdBQUYsRUFBWixDQUFwQjtBQUNBLFFBQU0sMENBQTRCO0FBQ2hDQSxJQUFBQSxHQURnQztBQUVoQ0MsSUFBQUEsT0FBTyxFQUFFQyxPQUZ1QjtBQUdoQ0MsSUFBQUEsYUFBYSxFQUFFLE1BQU0sb0NBQW1CLEVBQUVILEdBQUYsRUFBbkIsQ0FIVyxFQUE1QixDQUFOOztBQUtEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlR2l0aHViQnJhbmNoZWRSZWxlYXNlIH0gZnJvbSAnLi9yZWxlYXNlJ1xuaW1wb3J0IHsgbW9kdWxlUHJvamVjdCBhcyBidWlsZE1vZHVsZVByb2plY3QsIHdlYmFwcFByb2plY3QgYXMgYnVpbGRXZWJhcHBQcm9qZWN0IH0gZnJvbSAnLi9idWlsZFNvdXJjZUNvZGUnXG5pbXBvcnQgeyBidW1wVmVyc2lvbiB9IGZyb20gJy4vcGFja2FnZVZlcnNpb24nXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtb2R1bGVQcm9qZWN0KHsgYXBpLCB0YWdOYW1lIH0pIHtcbiAgbGV0IHZlcnNpb24gPSBhd2FpdCBidW1wVmVyc2lvbih7IGFwaSB9KVxuICBhd2FpdCBjcmVhdGVHaXRodWJCcmFuY2hlZFJlbGVhc2Uoe1xuICAgIGFwaSxcbiAgICB0YWdOYW1lOiB2ZXJzaW9uLFxuICAgIGJ1aWxkQ2FsbGJhY2s6ICgpID0+IGJ1aWxkTW9kdWxlUHJvamVjdCh7IGFwaSB9KSxcbiAgfSlcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdlYmFwcFByb2plY3QoeyBhcGksIHRhZ05hbWUgfSkge1xuICBsZXQgdmVyc2lvbiA9IGF3YWl0IGJ1bXBWZXJzaW9uKHsgYXBpIH0pXG4gIGF3YWl0IGNyZWF0ZUdpdGh1YkJyYW5jaGVkUmVsZWFzZSh7XG4gICAgYXBpLFxuICAgIHRhZ05hbWU6IHZlcnNpb24sXG4gICAgYnVpbGRDYWxsYmFjazogKCkgPT4gYnVpbGRXZWJhcHBQcm9qZWN0KHsgYXBpIH0pLFxuICB9KVxufVxuIl19