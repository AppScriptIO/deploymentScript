"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.moduleProject = moduleProject;exports.webappProject = webappProject;var _release = require("./release");
var _buildSourceCode = require("./buildSourceCode");
var _packageVersion = require("./packageVersion");
var _deploymentProvisioning = require("@deployment/deploymentProvisioning");

async function moduleProject({ api, tagName }) {
  _deploymentProvisioning.memgraphContainer.runDockerContainer();
  let version = await (0, _packageVersion.bumpVersion)({ api });
  await (0, _release.createGithubBranchedRelease)({
    api,
    tagName: tagName || version,
    buildCallback: () => (0, _buildSourceCode.moduleProject)({ api }) });

}

async function webappProject({ api, tagName }) {
  _deploymentProvisioning.memgraphContainer.runDockerContainer();
  let version = await (0, _packageVersion.bumpVersion)({ api });
  await (0, _release.createGithubBranchedRelease)({
    api,
    tagName: version,
    buildCallback: () => (0, _buildSourceCode.webappProject)({ api }) });

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvYnVpbGRBbmRSZWxlYXNlLmpzIl0sIm5hbWVzIjpbIm1vZHVsZVByb2plY3QiLCJhcGkiLCJ0YWdOYW1lIiwibWVtZ3JhcGhDb250YWluZXIiLCJydW5Eb2NrZXJDb250YWluZXIiLCJ2ZXJzaW9uIiwiYnVpbGRDYWxsYmFjayIsIndlYmFwcFByb2plY3QiXSwibWFwcGluZ3MiOiJ1SkFBQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxlQUFlQSxhQUFmLENBQTZCLEVBQUVDLEdBQUYsRUFBT0MsT0FBUCxFQUE3QixFQUErQztBQUNwREMsNENBQWtCQyxrQkFBbEI7QUFDQSxNQUFJQyxPQUFPLEdBQUcsTUFBTSxpQ0FBWSxFQUFFSixHQUFGLEVBQVosQ0FBcEI7QUFDQSxRQUFNLDBDQUE0QjtBQUNoQ0EsSUFBQUEsR0FEZ0M7QUFFaENDLElBQUFBLE9BQU8sRUFBRUEsT0FBTyxJQUFJRyxPQUZZO0FBR2hDQyxJQUFBQSxhQUFhLEVBQUUsTUFBTSxvQ0FBbUIsRUFBRUwsR0FBRixFQUFuQixDQUhXLEVBQTVCLENBQU47O0FBS0Q7O0FBRU0sZUFBZU0sYUFBZixDQUE2QixFQUFFTixHQUFGLEVBQU9DLE9BQVAsRUFBN0IsRUFBK0M7QUFDcERDLDRDQUFrQkMsa0JBQWxCO0FBQ0EsTUFBSUMsT0FBTyxHQUFHLE1BQU0saUNBQVksRUFBRUosR0FBRixFQUFaLENBQXBCO0FBQ0EsUUFBTSwwQ0FBNEI7QUFDaENBLElBQUFBLEdBRGdDO0FBRWhDQyxJQUFBQSxPQUFPLEVBQUVHLE9BRnVCO0FBR2hDQyxJQUFBQSxhQUFhLEVBQUUsTUFBTSxvQ0FBbUIsRUFBRUwsR0FBRixFQUFuQixDQUhXLEVBQTVCLENBQU47O0FBS0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVHaXRodWJCcmFuY2hlZFJlbGVhc2UgfSBmcm9tICcuL3JlbGVhc2UnXHJcbmltcG9ydCB7IG1vZHVsZVByb2plY3QgYXMgYnVpbGRNb2R1bGVQcm9qZWN0LCB3ZWJhcHBQcm9qZWN0IGFzIGJ1aWxkV2ViYXBwUHJvamVjdCB9IGZyb20gJy4vYnVpbGRTb3VyY2VDb2RlJ1xyXG5pbXBvcnQgeyBidW1wVmVyc2lvbiB9IGZyb20gJy4vcGFja2FnZVZlcnNpb24nXHJcbmltcG9ydCB7IG1lbWdyYXBoQ29udGFpbmVyIH0gZnJvbSAnQGRlcGxveW1lbnQvZGVwbG95bWVudFByb3Zpc2lvbmluZydcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtb2R1bGVQcm9qZWN0KHsgYXBpLCB0YWdOYW1lIH0pIHtcclxuICBtZW1ncmFwaENvbnRhaW5lci5ydW5Eb2NrZXJDb250YWluZXIoKSAvLyBydW4gbWVtZ3JhcGggY29udGFpbmVyIGZvciB1c2FnZSBpbiBidWlsZFRvb2wgZ3JhcGhUcmF2ZXJzYWwgbW9kdWxlLlxyXG4gIGxldCB2ZXJzaW9uID0gYXdhaXQgYnVtcFZlcnNpb24oeyBhcGkgfSlcclxuICBhd2FpdCBjcmVhdGVHaXRodWJCcmFuY2hlZFJlbGVhc2Uoe1xyXG4gICAgYXBpLFxyXG4gICAgdGFnTmFtZTogdGFnTmFtZSB8fCB2ZXJzaW9uLFxyXG4gICAgYnVpbGRDYWxsYmFjazogKCkgPT4gYnVpbGRNb2R1bGVQcm9qZWN0KHsgYXBpIH0pLFxyXG4gIH0pXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3ZWJhcHBQcm9qZWN0KHsgYXBpLCB0YWdOYW1lIH0pIHtcclxuICBtZW1ncmFwaENvbnRhaW5lci5ydW5Eb2NrZXJDb250YWluZXIoKSAvLyBydW4gbWVtZ3JhcGggY29udGFpbmVyIGZvciB1c2FnZSBpbiBidWlsZFRvb2wgZ3JhcGhUcmF2ZXJzYWwgbW9kdWxlLlxyXG4gIGxldCB2ZXJzaW9uID0gYXdhaXQgYnVtcFZlcnNpb24oeyBhcGkgfSlcclxuICBhd2FpdCBjcmVhdGVHaXRodWJCcmFuY2hlZFJlbGVhc2Uoe1xyXG4gICAgYXBpLFxyXG4gICAgdGFnTmFtZTogdmVyc2lvbixcclxuICAgIGJ1aWxkQ2FsbGJhY2s6ICgpID0+IGJ1aWxkV2ViYXBwUHJvamVjdCh7IGFwaSB9KSxcclxuICB9KVxyXG59XHJcbiJdfQ==