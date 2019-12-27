"use strict";var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.loadGraphDataFromFile = loadGraphDataFromFile;exports.exportAllGraphData = exportAllGraphData;exports.exportSubgraphData = exportSubgraphData;exports.exportSpecificGraphData = exportSpecificGraphData;exports.fixJSONData = fixJSONData;exports.clearDatabase = clearDatabase;

var _path = _interopRequireDefault(require("path"));
var _assert = _interopRequireDefault(require("assert"));
var _fs = require("fs");

var _graphTraversal = require("@dependency/graphTraversal");
var implementation = _interopRequireWildcard(require("@dependency/graphTraversal-implementation"));

const uuidv4 = require('uuid/v4');


function removeArrayDuplicateObjectByIdentity(array) {
  let unique = [];
  array.forEach(item => {
    if (!unique.some(i => i.identity == item.identity)) unique.push(item);
  });
  return unique;
}

async function loadGraphDataFromFile({ api, shouldClearDatabase = false, graphDataFilePath, url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } } = {}) {
  let concreteDatabaseBehavior = new _graphTraversal.Database.clientInterface({
    implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference: _graphTraversal.schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter' });

  let concereteDatabase = concreteDatabaseBehavior[_graphTraversal.Database.$.key.getter]();

  (0, _assert.default)(graphDataFilePath, `• graphDataFilePath must be passed to script - ${graphDataFilePath}`);
  const targetProjectRootPath = api.project.configuration.configuration.directory.root;
  if (shouldClearDatabase) await clearDatabase({ concereteDatabase, url });
  let absolutePath = _path.default.isAbsolute(graphDataFilePath) ? graphDataFilePath : _path.default.join(targetProjectRootPath, graphDataFilePath);
  let graphData = require(absolutePath);
  (0, _assert.default)(Array.isArray(graphData.node) && Array.isArray(graphData.edge), `• Unsupported graph data strcuture- ${graphData.edge} - ${graphData.node}`);
  await concereteDatabase.loadGraphData({ nodeEntryData: graphData.node, connectionEntryData: graphData.edge });
  concereteDatabase.driverInstance.close();
}


async function exportAllGraphData({
  api,
  targetPath = './test/asset/',
  fileName = 'graphData.exported.json',
  url = { protocol: 'bolt', hostname: 'localhost', port: 7687 },
  fixGraphData = true } =
{}) {var _node$edge;
  let concreteDatabaseBehavior = new _graphTraversal.Database.clientInterface({
    implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference: _graphTraversal.schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter' });

  let concereteDatabase = concreteDatabaseBehavior[_graphTraversal.Database.$.key.getter]();

  const targetProjectRootPath = api.project.configuration.configuration.directory.root;
  const exportPath = _path.default.normalize(_path.default.join(targetProjectRootPath, targetPath));

  let graphData = (_node$edge = { node: await concereteDatabase.getAllNode(), edge: await concereteDatabase.getAllEdge() }, JSON.stringify(_node$edge));

  if (!(0, _fs.existsSync)(exportPath)) (0, _fs.mkdirSync)(exportPath, { recursive: true });
  await _fs.promises.writeFile(_path.default.join(exportPath, fileName), graphData, { encoding: 'utf8', flag: 'w' });
  console.log(`• Created json file - ${_path.default.join(exportPath, fileName)}`);

  if (fixGraphData) await fixJSONData({ api, targetPath, exportedFileName: fileName, targetFileName: fileName, url });

  concereteDatabase.driverInstance.close();
}


async function exportSubgraphData({
  api,
  subgraphEntryNodeKeyList = [],
  targetPath = './test/asset/',
  fileName = 'specific.exported.json',
  url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } } =
{}) {var _node$edge2;
  let concreteDatabaseBehavior = new _graphTraversal.Database.clientInterface({
    implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference: _graphTraversal.schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter' });

  let concereteDatabase = concreteDatabaseBehavior[_graphTraversal.Database.$.key.getter]();

  const targetProjectRootPath = api.project.configuration.configuration.directory.root;
  const exportPath = _path.default.normalize(_path.default.join(targetProjectRootPath, targetPath));


  let subgraphEntryNodeIdentityList = new Set();
  for (let key of subgraphEntryNodeKeyList) subgraphEntryNodeIdentityList.add((await concereteDatabase.getNodeByKey({ key })).identity);

  let exportNodeList = new Set(),
  exportEdgeList = new Set();


  let hashTraversedNode = new Set();
  async function addRelatedNode(nodeArray) {
    for (let identity of nodeArray) {
      if (!hashTraversedNode.has(identity)) {
        hashTraversedNode.add(identity);

        let connectionArray = await concereteDatabase.getNodeConnection({ nodeID: identity });
        exportEdgeList = new Set([...exportEdgeList, ...connectionArray.map(result => result.connection.identity)]);

        let nextNodeArray = new Set(
        [...connectionArray.map(result => result.destination.identity), ...connectionArray.map(result => result.source.identity)].filter(identity => !nodeArray.has(identity)));


        await addRelatedNode(nextNodeArray);
      }
      exportNodeList.add(identity);
    }
  }

  await addRelatedNode(subgraphEntryNodeIdentityList);

  let exportNode = (await concereteDatabase.getAllNode()).filter(node => exportNodeList.has(node.identity)),
  exportEdge = (await concereteDatabase.getAllEdge()).filter(edge => exportEdgeList.has(edge.identity));

  let graphData = (_node$edge2 = { node: exportNode, edge: exportEdge }, JSON.stringify(_node$edge2));
  await _fs.promises.writeFile(_path.default.join(exportPath, fileName), graphData, { encoding: 'utf8', flag: 'w' });
  console.log(`• Created json file - ${_path.default.join(exportPath, fileName)}`);
  concereteDatabase.driverInstance.close();
}

async function exportSpecificGraphData({ api, targetPath = './test/asset/', fileName = 'specific.exported.json', url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } } = {}) {var _node$edge3;
  let concreteDatabaseBehavior = new _graphTraversal.Database.clientInterface({
    implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference: _graphTraversal.schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter' });

  let concereteDatabase = concreteDatabaseBehavior[_graphTraversal.Database.$.key.getter]();

  const targetProjectRootPath = api.project.configuration.configuration.directory.root;
  const exportPath = _path.default.normalize(_path.default.join(targetProjectRootPath, targetPath));


  let nodeKeyArray = [];


  let nodeArray = [],
  edgeArray = [];


  for (let key of nodeKeyArray) nodeArray.push((await concereteDatabase.getNodeByKey({ key })));


  for (let node of nodeArray) {
    let queryResultArray = await concereteDatabase.getNodeConnection({ nodeID: node.identity });
    queryResultArray = queryResultArray.map(result => result.connection);
    edgeArray = [...edgeArray, ...queryResultArray];
  }


  edgeArray = edgeArray.filter(edge => nodeArray.some(node => node.identity == edge.start) && nodeArray.some(node => node.identity == edge.end));

  edgeArray = removeArrayDuplicateObjectByIdentity(edgeArray);

  let graphData = (_node$edge3 = { node: nodeArray, edge: edgeArray }, JSON.stringify(_node$edge3));
  await _fs.promises.writeFile(_path.default.join(exportPath, fileName), graphData, { encoding: 'utf8', flag: 'w' });
  console.log(`• Created json file - ${_path.default.join(exportPath, fileName)}`);
  concereteDatabase.driverInstance.close();
}




async function fixJSONData({ api, targetPath = './resource/', exportedFileName = 'fixed.exported.json', targetFileName = 'taskSequence.graphData.json' } = {}) {var _graphData;
  const targetProjectRootPath = api.project.configuration.configuration.directory.root;
  let graphData = require(_path.default.join(targetProjectRootPath, targetPath, targetFileName));


  graphData.node = graphData.node.map(item => {

    if (!item.properties.key) {
      console.log(`• Fixing node without key - ` + JSON.stringify(item));
      item.properties.key = uuidv4();
    }
    return item;
  });
  graphData.edge = graphData.edge.map(item => {

    if (!item.properties.key) {
      console.log(`• Fixing edge without key - ` + JSON.stringify(item));
      item.properties.key = uuidv4();
    }
    return item;
  });

  const exportPath = _path.default.normalize(_path.default.join(targetProjectRootPath, targetPath, exportedFileName));
  await _fs.promises.writeFile(exportPath, (_graphData = graphData, JSON.stringify(_graphData)), { encoding: 'utf8', flag: 'w' });
  console.log(`• Created json file - ${exportPath}`);
}

async function clearDatabase({ concereteDatabase, url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } }) {
  if (!concereteDatabase) {
    let concreteDatabaseBehavior = new _graphTraversal.Database.clientInterface({
      implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference: _graphTraversal.schemeReference }) },
      defaultImplementation: 'boltCypherModelAdapter' });

    concereteDatabase = concreteDatabaseBehavior[_graphTraversal.Database.$.key.getter]();
  }


  const graphDBDriver = concereteDatabase.driverInstance;
  let session = await graphDBDriver.session();
  await session.run(`match (n) detach delete n`);
  console.log('• Database data cleared.');
  session.close();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9ncmFwaERhdGFiYXNlL2dyYXBoRGF0YUxvYWRpbmcuanMiXSwibmFtZXMiOlsidXVpZHY0IiwicmVxdWlyZSIsInJlbW92ZUFycmF5RHVwbGljYXRlT2JqZWN0QnlJZGVudGl0eSIsImFycmF5IiwidW5pcXVlIiwiZm9yRWFjaCIsIml0ZW0iLCJzb21lIiwiaSIsImlkZW50aXR5IiwicHVzaCIsImxvYWRHcmFwaERhdGFGcm9tRmlsZSIsImFwaSIsInNob3VsZENsZWFyRGF0YWJhc2UiLCJncmFwaERhdGFGaWxlUGF0aCIsInVybCIsInByb3RvY29sIiwiaG9zdG5hbWUiLCJwb3J0IiwiY29uY3JldGVEYXRhYmFzZUJlaGF2aW9yIiwiRGF0YWJhc2UiLCJjbGllbnRJbnRlcmZhY2UiLCJpbXBsZW1lbnRhdGlvbkxpc3QiLCJib2x0Q3lwaGVyTW9kZWxBZGFwdGVyIiwiaW1wbGVtZW50YXRpb24iLCJkYXRhYmFzZSIsImJvbHRDeXBoZXJNb2RlbEFkYXB0ZXJGdW5jdGlvbiIsInNjaGVtZVJlZmVyZW5jZSIsImRlZmF1bHRJbXBsZW1lbnRhdGlvbiIsImNvbmNlcmV0ZURhdGFiYXNlIiwiJCIsImtleSIsImdldHRlciIsInRhcmdldFByb2plY3RSb290UGF0aCIsInByb2plY3QiLCJjb25maWd1cmF0aW9uIiwiZGlyZWN0b3J5Iiwicm9vdCIsImNsZWFyRGF0YWJhc2UiLCJhYnNvbHV0ZVBhdGgiLCJwYXRoIiwiaXNBYnNvbHV0ZSIsImpvaW4iLCJncmFwaERhdGEiLCJBcnJheSIsImlzQXJyYXkiLCJub2RlIiwiZWRnZSIsImxvYWRHcmFwaERhdGEiLCJub2RlRW50cnlEYXRhIiwiY29ubmVjdGlvbkVudHJ5RGF0YSIsImRyaXZlckluc3RhbmNlIiwiY2xvc2UiLCJleHBvcnRBbGxHcmFwaERhdGEiLCJ0YXJnZXRQYXRoIiwiZmlsZU5hbWUiLCJmaXhHcmFwaERhdGEiLCJleHBvcnRQYXRoIiwibm9ybWFsaXplIiwiZ2V0QWxsTm9kZSIsImdldEFsbEVkZ2UiLCJKU09OIiwic3RyaW5naWZ5IiwicmVjdXJzaXZlIiwiZmlsZXN5c3RlbSIsIndyaXRlRmlsZSIsImVuY29kaW5nIiwiZmxhZyIsImNvbnNvbGUiLCJsb2ciLCJmaXhKU09ORGF0YSIsImV4cG9ydGVkRmlsZU5hbWUiLCJ0YXJnZXRGaWxlTmFtZSIsImV4cG9ydFN1YmdyYXBoRGF0YSIsInN1YmdyYXBoRW50cnlOb2RlS2V5TGlzdCIsInN1YmdyYXBoRW50cnlOb2RlSWRlbnRpdHlMaXN0IiwiU2V0IiwiYWRkIiwiZ2V0Tm9kZUJ5S2V5IiwiZXhwb3J0Tm9kZUxpc3QiLCJleHBvcnRFZGdlTGlzdCIsImhhc2hUcmF2ZXJzZWROb2RlIiwiYWRkUmVsYXRlZE5vZGUiLCJub2RlQXJyYXkiLCJoYXMiLCJjb25uZWN0aW9uQXJyYXkiLCJnZXROb2RlQ29ubmVjdGlvbiIsIm5vZGVJRCIsIm1hcCIsInJlc3VsdCIsImNvbm5lY3Rpb24iLCJuZXh0Tm9kZUFycmF5IiwiZGVzdGluYXRpb24iLCJzb3VyY2UiLCJmaWx0ZXIiLCJleHBvcnROb2RlIiwiZXhwb3J0RWRnZSIsImV4cG9ydFNwZWNpZmljR3JhcGhEYXRhIiwibm9kZUtleUFycmF5IiwiZWRnZUFycmF5IiwicXVlcnlSZXN1bHRBcnJheSIsInN0YXJ0IiwiZW5kIiwicHJvcGVydGllcyIsImdyYXBoREJEcml2ZXIiLCJzZXNzaW9uIiwicnVuIl0sIm1hcHBpbmdzIjoiOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLE1BQU1BLE1BQU0sR0FBR0MsT0FBTyxDQUFDLFNBQUQsQ0FBdEI7OztBQUdBLFNBQVNDLG9DQUFULENBQThDQyxLQUE5QyxFQUFxRDtBQUNuRCxNQUFJQyxNQUFNLEdBQUcsRUFBYjtBQUNBRCxFQUFBQSxLQUFLLENBQUNFLE9BQU4sQ0FBY0MsSUFBSSxJQUFJO0FBQ3BCLFFBQUksQ0FBQ0YsTUFBTSxDQUFDRyxJQUFQLENBQVlDLENBQUMsSUFBSUEsQ0FBQyxDQUFDQyxRQUFGLElBQWNI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RUFBcEI7QUFDQSxRQUFNQSxPQUFPLENBQUNDLEdBQVIsQ0FBYSwyQkFBYixDQUFOO0FBQ0F0QyxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSwwQkFBWjtBQUNBb0MsRUFBQUEsT0FBTyxDQUFDckQsS0FBUjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gcHJvZHVjZSBqc29uIGdyYXBoIGRhdGEgZnJvbSBkYXRhYmFzZSBxdWVyaWVzXHJcblxyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCdcclxuaW1wb3J0IHsgcHJvbWlzZXMgYXMgZmlsZXN5c3RlbSwgZXhpc3RzU3luYywgbWtkaXJTeW5jIH0gZnJvbSAnZnMnXHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJ0BkZXBlbmRlbmN5L2VudGl0eSdcclxuaW1wb3J0IHsgRGF0YWJhc2UsIHNjaGVtZVJlZmVyZW5jZSB9IGZyb20gJ0BkZXBlbmRlbmN5L2dyYXBoVHJhdmVyc2FsJ1xyXG5pbXBvcnQgKiBhcyBpbXBsZW1lbnRhdGlvbiBmcm9tICdAZGVwZW5kZW5jeS9ncmFwaFRyYXZlcnNhbC1pbXBsZW1lbnRhdGlvbidcclxuaW1wb3J0IHsgZmlsZSB9IGZyb20gJ2JhYmVsLXR5cGVzJ1xyXG5jb25zdCB1dWlkdjQgPSByZXF1aXJlKCd1dWlkL3Y0JylcclxuXHJcbi8vIHJlbW92ZSBkdXBsaWNhdGUgb2JqZWN0cyBmcm9tIGFycmF5IHVzaW5nIHRoZSBpZGVudGl0eSBwcm9wZXJ0eSB0byBjaGVjayBlcXVhbGl0eVxyXG5mdW5jdGlvbiByZW1vdmVBcnJheUR1cGxpY2F0ZU9iamVjdEJ5SWRlbnRpdHkoYXJyYXkpIHtcclxuICBsZXQgdW5pcXVlID0gW11cclxuICBhcnJheS5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgaWYgKCF1bmlxdWUuc29tZShpID0+IGkuaWRlbnRpdHkgPT0gaXRlbS5pZGVudGl0eSkpIHVuaXF1ZS5wdXNoKGl0ZW0pXHJcbiAgfSlcclxuICByZXR1cm4gdW5pcXVlXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkR3JhcGhEYXRhRnJvbUZpbGUoeyBhcGkgLyoqc2NyaXB0TWFuYWdlciBhcGkqLywgc2hvdWxkQ2xlYXJEYXRhYmFzZSA9IGZhbHNlLCBncmFwaERhdGFGaWxlUGF0aCwgdXJsID0geyBwcm90b2NvbDogJ2JvbHQnLCBob3N0bmFtZTogJ2xvY2FsaG9zdCcsIHBvcnQ6IDc2ODcgfSB9ID0ge30pIHtcclxuICBsZXQgY29uY3JldGVEYXRhYmFzZUJlaGF2aW9yID0gbmV3IERhdGFiYXNlLmNsaWVudEludGVyZmFjZSh7XHJcbiAgICBpbXBsZW1lbnRhdGlvbkxpc3Q6IHsgYm9sdEN5cGhlck1vZGVsQWRhcHRlcjogaW1wbGVtZW50YXRpb24uZGF0YWJhc2UuYm9sdEN5cGhlck1vZGVsQWRhcHRlckZ1bmN0aW9uKHsgdXJsLCBzY2hlbWVSZWZlcmVuY2UgfSkgfSxcclxuICAgIGRlZmF1bHRJbXBsZW1lbnRhdGlvbjogJ2JvbHRDeXBoZXJNb2RlbEFkYXB0ZXInLFxyXG4gIH0pXHJcbiAgbGV0IGNvbmNlcmV0ZURhdGFiYXNlID0gY29uY3JldGVEYXRhYmFzZUJlaGF2aW9yW0RhdGFiYXNlLiQua2V5LmdldHRlcl0oKVxyXG5cclxuICBhc3NlcnQoZ3JhcGhEYXRhRmlsZVBhdGgsIGDigKIgZ3JhcGhEYXRhRmlsZVBhdGggbXVzdCBiZSBwYXNzZWQgdG8gc2NyaXB0IC0gJHtncmFwaERhdGFGaWxlUGF0aH1gKVxyXG4gIGNvbnN0IHRhcmdldFByb2plY3RSb290UGF0aCA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbi5kaXJlY3Rvcnkucm9vdFxyXG4gIGlmIChzaG91bGRDbGVhckRhdGFiYXNlKSBhd2FpdCBjbGVhckRhdGFiYXNlKHsgY29uY2VyZXRlRGF0YWJhc2UsIHVybCB9KVxyXG4gIGxldCBhYnNvbHV0ZVBhdGggPSBwYXRoLmlzQWJzb2x1dGUoZ3JhcGhEYXRhRmlsZVBhdGgpID8gZ3JhcGhEYXRhRmlsZVBhdGggOiBwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3RQYXRoLCBncmFwaERhdGFGaWxlUGF0aClcclxuICBsZXQgZ3JhcGhEYXRhID0gcmVxdWlyZShhYnNvbHV0ZVBhdGgpXHJcbiAgYXNzZXJ0KEFycmF5LmlzQXJyYXkoZ3JhcGhEYXRhLm5vZGUpICYmIEFycmF5LmlzQXJyYXkoZ3JhcGhEYXRhLmVkZ2UpLCBg4oCiIFVuc3VwcG9ydGVkIGdyYXBoIGRhdGEgc3RyY3V0dXJlLSAke2dyYXBoRGF0YS5lZGdlfSAtICR7Z3JhcGhEYXRhLm5vZGV9YClcclxuICBhd2FpdCBjb25jZXJldGVEYXRhYmFzZS5sb2FkR3JhcGhEYXRhKHsgbm9kZUVudHJ5RGF0YTogZ3JhcGhEYXRhLm5vZGUsIGNvbm5lY3Rpb25FbnRyeURhdGE6IGdyYXBoRGF0YS5lZGdlIH0pXHJcbiAgY29uY2VyZXRlRGF0YWJhc2UuZHJpdmVySW5zdGFuY2UuY2xvc2UoKVxyXG59XHJcblxyXG4vLyBSZWxpZXMgb24gdGhlIGludGVyZmFjZSBmb3IgY29uY3JldGUgZGF0YWJhc2UgcGx1Z2lucyBvZiBncmFwaFRyYXZlcnNhbCBtb2R1bGUuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRBbGxHcmFwaERhdGEoe1xyXG4gIGFwaSxcclxuICB0YXJnZXRQYXRoID0gJy4vdGVzdC9hc3NldC8nLFxyXG4gIGZpbGVOYW1lID0gJ2dyYXBoRGF0YS5leHBvcnRlZC5qc29uJyxcclxuICB1cmwgPSB7IHByb3RvY29sOiAnYm9sdCcsIGhvc3RuYW1lOiAnbG9jYWxob3N0JywgcG9ydDogNzY4NyB9LFxyXG4gIGZpeEdyYXBoRGF0YSA9IHRydWUsXHJcbn0gPSB7fSkge1xyXG4gIGxldCBjb25jcmV0ZURhdGFiYXNlQmVoYXZpb3IgPSBuZXcgRGF0YWJhc2UuY2xpZW50SW50ZXJmYWNlKHtcclxuICAgIGltcGxlbWVudGF0aW9uTGlzdDogeyBib2x0Q3lwaGVyTW9kZWxBZGFwdGVyOiBpbXBsZW1lbnRhdGlvbi5kYXRhYmFzZS5ib2x0Q3lwaGVyTW9kZWxBZGFwdGVyRnVuY3Rpb24oeyB1cmwsIHNjaGVtZVJlZmVyZW5jZSB9KSB9LFxyXG4gICAgZGVmYXVsdEltcGxlbWVudGF0aW9uOiAnYm9sdEN5cGhlck1vZGVsQWRhcHRlcicsXHJcbiAgfSlcclxuICBsZXQgY29uY2VyZXRlRGF0YWJhc2UgPSBjb25jcmV0ZURhdGFiYXNlQmVoYXZpb3JbRGF0YWJhc2UuJC5rZXkuZ2V0dGVyXSgpXHJcblxyXG4gIGNvbnN0IHRhcmdldFByb2plY3RSb290UGF0aCA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbi5kaXJlY3Rvcnkucm9vdFxyXG4gIGNvbnN0IGV4cG9ydFBhdGggPSBwYXRoLm5vcm1hbGl6ZShwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3RQYXRoLCB0YXJnZXRQYXRoKSlcclxuXHJcbiAgbGV0IGdyYXBoRGF0YSA9IHsgbm9kZTogYXdhaXQgY29uY2VyZXRlRGF0YWJhc2UuZ2V0QWxsTm9kZSgpLCBlZGdlOiBhd2FpdCBjb25jZXJldGVEYXRhYmFzZS5nZXRBbGxFZGdlKCkgfSB8PiBKU09OLnN0cmluZ2lmeVxyXG5cclxuICBpZiAoIWV4aXN0c1N5bmMoZXhwb3J0UGF0aCkpIG1rZGlyU3luYyhleHBvcnRQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KSAvLyBjcmVhdGUgYmFzZSBkaXJlY3RvcnkgaWYgaXQgZG9lc24ndCBleGlzdFxyXG4gIGF3YWl0IGZpbGVzeXN0ZW0ud3JpdGVGaWxlKHBhdGguam9pbihleHBvcnRQYXRoLCBmaWxlTmFtZSksIGdyYXBoRGF0YSwgeyBlbmNvZGluZzogJ3V0ZjgnLCBmbGFnOiAndycgLyp0cnVjdGFjZSBmaWxlIGlmIGV4aXN0cyBhbmQgY3JlYXRlIGEgbmV3IG9uZSovIH0pXHJcbiAgY29uc29sZS5sb2coYOKAoiBDcmVhdGVkIGpzb24gZmlsZSAtICR7cGF0aC5qb2luKGV4cG9ydFBhdGgsIGZpbGVOYW1lKX1gKVxyXG5cclxuICBpZiAoZml4R3JhcGhEYXRhKSBhd2FpdCBmaXhKU09ORGF0YSh7IGFwaSwgdGFyZ2V0UGF0aCwgZXhwb3J0ZWRGaWxlTmFtZTogZmlsZU5hbWUsIHRhcmdldEZpbGVOYW1lOiBmaWxlTmFtZSwgdXJsIH0pIC8vIEZvciBub2RlcyBsYWtpbmcga2V5cywgZ2VuZXJhdGUgcmFuZG9tIGtleXMuXHJcblxyXG4gIGNvbmNlcmV0ZURhdGFiYXNlLmRyaXZlckluc3RhbmNlLmNsb3NlKClcclxufVxyXG5cclxuLy8gRXhwb3J0IHN1YmdyYXBocyB0aHJvdWdoIHNwZWNpZnlpbmcgZW50cnlwb2ludHMgd2hpY2ggd2lsbCByZWN1cnNpdmVseSB0cmF2ZXJzZSB0aHJvdWdoIG5laWdoYm9yaW5nIG5vZGVzIGFuZCBhZGQgdGhlbS5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFN1YmdyYXBoRGF0YSh7XHJcbiAgYXBpLFxyXG4gIHN1YmdyYXBoRW50cnlOb2RlS2V5TGlzdCA9IFtdLFxyXG4gIHRhcmdldFBhdGggPSAnLi90ZXN0L2Fzc2V0LycsXHJcbiAgZmlsZU5hbWUgPSAnc3BlY2lmaWMuZXhwb3J0ZWQuanNvbicsXHJcbiAgdXJsID0geyBwcm90b2NvbDogJ2JvbHQnLCBob3N0bmFtZTogJ2xvY2FsaG9zdCcsIHBvcnQ6IDc2ODcgfSxcclxufSA9IHt9KSB7XHJcbiAgbGV0IGNvbmNyZXRlRGF0YWJhc2VCZWhhdmlvciA9IG5ldyBEYXRhYmFzZS5jbGllbnRJbnRlcmZhY2Uoe1xyXG4gICAgaW1wbGVtZW50YXRpb25MaXN0OiB7IGJvbHRDeXBoZXJNb2RlbEFkYXB0ZXI6IGltcGxlbWVudGF0aW9uLmRhdGFiYXNlLmJvbHRDeXBoZXJNb2RlbEFkYXB0ZXJGdW5jdGlvbih7IHVybCwgc2NoZW1lUmVmZXJlbmNlIH0pIH0sXHJcbiAgICBkZWZhdWx0SW1wbGVtZW50YXRpb246ICdib2x0Q3lwaGVyTW9kZWxBZGFwdGVyJyxcclxuICB9KVxyXG4gIGxldCBjb25jZXJldGVEYXRhYmFzZSA9IGNvbmNyZXRlRGF0YWJhc2VCZWhhdmlvcltEYXRhYmFzZS4kLmtleS5nZXR0ZXJdKClcclxuXHJcbiAgY29uc3QgdGFyZ2V0UHJvamVjdFJvb3RQYXRoID0gYXBpLnByb2plY3QuY29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9uLmRpcmVjdG9yeS5yb290XHJcbiAgY29uc3QgZXhwb3J0UGF0aCA9IHBhdGgubm9ybWFsaXplKHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdFBhdGgsIHRhcmdldFBhdGgpKVxyXG5cclxuICAvLyBjb252ZXJ0IGtleSB0byBpZGVudGl0eSBvZiBub2RlXHJcbiAgbGV0IHN1YmdyYXBoRW50cnlOb2RlSWRlbnRpdHlMaXN0ID0gbmV3IFNldCgpXHJcbiAgZm9yIChsZXQga2V5IG9mIHN1YmdyYXBoRW50cnlOb2RlS2V5TGlzdCkgc3ViZ3JhcGhFbnRyeU5vZGVJZGVudGl0eUxpc3QuYWRkKChhd2FpdCBjb25jZXJldGVEYXRhYmFzZS5nZXROb2RlQnlLZXkoeyBrZXkgfSkpLmlkZW50aXR5KVxyXG5cclxuICBsZXQgZXhwb3J0Tm9kZUxpc3QgPSBuZXcgU2V0KCksXHJcbiAgICBleHBvcnRFZGdlTGlzdCA9IG5ldyBTZXQoKVxyXG5cclxuICAvLyBnZXQgdGhlIGNvbm5lY3Rpb25zIGJldHdlZW4gdGhlIG5vZGVzXHJcbiAgbGV0IGhhc2hUcmF2ZXJzZWROb2RlID0gbmV3IFNldCgpXHJcbiAgYXN5bmMgZnVuY3Rpb24gYWRkUmVsYXRlZE5vZGUobm9kZUFycmF5KSB7XHJcbiAgICBmb3IgKGxldCBpZGVudGl0eSBvZiBub2RlQXJyYXkpIHtcclxuICAgICAgaWYgKCFoYXNoVHJhdmVyc2VkTm9kZS5oYXMoaWRlbnRpdHkpKSB7XHJcbiAgICAgICAgaGFzaFRyYXZlcnNlZE5vZGUuYWRkKGlkZW50aXR5KVxyXG5cclxuICAgICAgICBsZXQgY29ubmVjdGlvbkFycmF5ID0gYXdhaXQgY29uY2VyZXRlRGF0YWJhc2UuZ2V0Tm9kZUNvbm5lY3Rpb24oeyBub2RlSUQ6IGlkZW50aXR5IH0pXHJcbiAgICAgICAgZXhwb3J0RWRnZUxpc3QgPSBuZXcgU2V0KFsuLi5leHBvcnRFZGdlTGlzdCwgLi4uY29ubmVjdGlvbkFycmF5Lm1hcChyZXN1bHQgPT4gcmVzdWx0LmNvbm5lY3Rpb24uaWRlbnRpdHkpIC8qKiBnZXQgdGhlIGNvbm5lY3Rpb25zIG9ubHkgd2l0aG91dCB0aGUgZGVzdGluYXRpb24gYW5kIHNvdXJjZSBub2RlcyAqL10pXHJcblxyXG4gICAgICAgIGxldCBuZXh0Tm9kZUFycmF5ID0gbmV3IFNldChcclxuICAgICAgICAgIFsuLi5jb25uZWN0aW9uQXJyYXkubWFwKHJlc3VsdCA9PiByZXN1bHQuZGVzdGluYXRpb24uaWRlbnRpdHkpLCAuLi5jb25uZWN0aW9uQXJyYXkubWFwKHJlc3VsdCA9PiByZXN1bHQuc291cmNlLmlkZW50aXR5KV0uZmlsdGVyKGlkZW50aXR5ID0+ICFub2RlQXJyYXkuaGFzKGlkZW50aXR5KSksXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBhd2FpdCBhZGRSZWxhdGVkTm9kZShuZXh0Tm9kZUFycmF5KVxyXG4gICAgICB9XHJcbiAgICAgIGV4cG9ydE5vZGVMaXN0LmFkZChpZGVudGl0eSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGF3YWl0IGFkZFJlbGF0ZWROb2RlKHN1YmdyYXBoRW50cnlOb2RlSWRlbnRpdHlMaXN0KVxyXG5cclxuICBsZXQgZXhwb3J0Tm9kZSA9IChhd2FpdCBjb25jZXJldGVEYXRhYmFzZS5nZXRBbGxOb2RlKCkpLmZpbHRlcihub2RlID0+IGV4cG9ydE5vZGVMaXN0Lmhhcyhub2RlLmlkZW50aXR5KSksXHJcbiAgICBleHBvcnRFZGdlID0gKGF3YWl0IGNvbmNlcmV0ZURhdGFiYXNlLmdldEFsbEVkZ2UoKSkuZmlsdGVyKGVkZ2UgPT4gZXhwb3J0RWRnZUxpc3QuaGFzKGVkZ2UuaWRlbnRpdHkpKVxyXG5cclxuICBsZXQgZ3JhcGhEYXRhID0geyBub2RlOiBleHBvcnROb2RlLCBlZGdlOiBleHBvcnRFZGdlIH0gfD4gSlNPTi5zdHJpbmdpZnlcclxuICBhd2FpdCBmaWxlc3lzdGVtLndyaXRlRmlsZShwYXRoLmpvaW4oZXhwb3J0UGF0aCwgZmlsZU5hbWUpLCBncmFwaERhdGEsIHsgZW5jb2Rpbmc6ICd1dGY4JywgZmxhZzogJ3cnIC8qdHJ1Y3RhY2UgZmlsZSBpZiBleGlzdHMgYW5kIGNyZWF0ZSBhIG5ldyBvbmUqLyB9KVxyXG4gIGNvbnNvbGUubG9nKGDigKIgQ3JlYXRlZCBqc29uIGZpbGUgLSAke3BhdGguam9pbihleHBvcnRQYXRoLCBmaWxlTmFtZSl9YClcclxuICBjb25jZXJldGVEYXRhYmFzZS5kcml2ZXJJbnN0YW5jZS5jbG9zZSgpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRTcGVjaWZpY0dyYXBoRGF0YSh7IGFwaSwgdGFyZ2V0UGF0aCA9ICcuL3Rlc3QvYXNzZXQvJywgZmlsZU5hbWUgPSAnc3BlY2lmaWMuZXhwb3J0ZWQuanNvbicsIHVybCA9IHsgcHJvdG9jb2w6ICdib2x0JywgaG9zdG5hbWU6ICdsb2NhbGhvc3QnLCBwb3J0OiA3Njg3IH0gfSA9IHt9KSB7XHJcbiAgbGV0IGNvbmNyZXRlRGF0YWJhc2VCZWhhdmlvciA9IG5ldyBEYXRhYmFzZS5jbGllbnRJbnRlcmZhY2Uoe1xyXG4gICAgaW1wbGVtZW50YXRpb25MaXN0OiB7IGJvbHRDeXBoZXJNb2RlbEFkYXB0ZXI6IGltcGxlbWVudGF0aW9uLmRhdGFiYXNlLmJvbHRDeXBoZXJNb2RlbEFkYXB0ZXJGdW5jdGlvbih7IHVybCwgc2NoZW1lUmVmZXJlbmNlIH0pIH0sXHJcbiAgICBkZWZhdWx0SW1wbGVtZW50YXRpb246ICdib2x0Q3lwaGVyTW9kZWxBZGFwdGVyJyxcclxuICB9KVxyXG4gIGxldCBjb25jZXJldGVEYXRhYmFzZSA9IGNvbmNyZXRlRGF0YWJhc2VCZWhhdmlvcltEYXRhYmFzZS4kLmtleS5nZXR0ZXJdKClcclxuXHJcbiAgY29uc3QgdGFyZ2V0UHJvamVjdFJvb3RQYXRoID0gYXBpLnByb2plY3QuY29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9uLmRpcmVjdG9yeS5yb290XHJcbiAgY29uc3QgZXhwb3J0UGF0aCA9IHBhdGgubm9ybWFsaXplKHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdFBhdGgsIHRhcmdldFBhdGgpKVxyXG5cclxuICAvLyBwcm92aWRlIGxpc3Qgb2Ygbm9kZSBrZXlzIHRvIGV4cG9ydCAobm9kZXMgd2lsbCBiZSBleHBvcnRlZCB3aXRoIHRoZWlyIGNvbm5lY3Rpb25zIHJlbGF0ZWQgdG8gdGhlIHNwZWNpZmljIG5vZGVzIG9ubHkpXHJcbiAgbGV0IG5vZGVLZXlBcnJheSA9IFtcclxuICAgIC8vIGxpc3Qgb2Ygbm9kZSBrZXlzIHRvIGV4cG9ydC5cclxuICBdXHJcbiAgbGV0IG5vZGVBcnJheSA9IFtdLFxyXG4gICAgZWRnZUFycmF5ID0gW11cclxuXHJcbiAgLy8gZ2V0IG5vZGVzXHJcbiAgZm9yIChsZXQga2V5IG9mIG5vZGVLZXlBcnJheSkgbm9kZUFycmF5LnB1c2goYXdhaXQgY29uY2VyZXRlRGF0YWJhc2UuZ2V0Tm9kZUJ5S2V5KHsga2V5IH0pKVxyXG5cclxuICAvLyBnZXQgdGhlIGNvbm5lY3Rpb25zIGJldHdlZW4gdGhlIG5vZGVzXHJcbiAgZm9yIChsZXQgbm9kZSBvZiBub2RlQXJyYXkpIHtcclxuICAgIGxldCBxdWVyeVJlc3VsdEFycmF5ID0gYXdhaXQgY29uY2VyZXRlRGF0YWJhc2UuZ2V0Tm9kZUNvbm5lY3Rpb24oeyBub2RlSUQ6IG5vZGUuaWRlbnRpdHkgfSlcclxuICAgIHF1ZXJ5UmVzdWx0QXJyYXkgPSBxdWVyeVJlc3VsdEFycmF5Lm1hcChyZXN1bHQgPT4gcmVzdWx0LmNvbm5lY3Rpb24pIC8vIGdldCB0aGUgY29ubmVjdGlvbnMgb25seSB3aXRob3V0IHRoZSBkZXN0aW5hdGlvbiBhbmQgc291cmNlIG5vZGVzXHJcbiAgICBlZGdlQXJyYXkgPSBbLi4uZWRnZUFycmF5LCAuLi5xdWVyeVJlc3VsdEFycmF5XVxyXG4gIH1cclxuXHJcbiAgLy8gZmlsdGVyIGVkZ2VzIG9mIHRoZSBzcGVjaWZpYyBub2RlcyBvbmx5XHJcbiAgZWRnZUFycmF5ID0gZWRnZUFycmF5LmZpbHRlcihlZGdlID0+IG5vZGVBcnJheS5zb21lKG5vZGUgPT4gbm9kZS5pZGVudGl0eSA9PSBlZGdlLnN0YXJ0KSAmJiBub2RlQXJyYXkuc29tZShub2RlID0+IG5vZGUuaWRlbnRpdHkgPT0gZWRnZS5lbmQpKVxyXG4gIC8vIGZpbHRlciBkdXBsaWNhdGVzXHJcbiAgZWRnZUFycmF5ID0gcmVtb3ZlQXJyYXlEdXBsaWNhdGVPYmplY3RCeUlkZW50aXR5KGVkZ2VBcnJheSlcclxuXHJcbiAgbGV0IGdyYXBoRGF0YSA9IHsgbm9kZTogbm9kZUFycmF5LCBlZGdlOiBlZGdlQXJyYXkgfSB8PiBKU09OLnN0cmluZ2lmeVxyXG4gIGF3YWl0IGZpbGVzeXN0ZW0ud3JpdGVGaWxlKHBhdGguam9pbihleHBvcnRQYXRoLCBmaWxlTmFtZSksIGdyYXBoRGF0YSwgeyBlbmNvZGluZzogJ3V0ZjgnLCBmbGFnOiAndycgLyp0cnVjdGFjZSBmaWxlIGlmIGV4aXN0cyBhbmQgY3JlYXRlIGEgbmV3IG9uZSovIH0pXHJcbiAgY29uc29sZS5sb2coYOKAoiBDcmVhdGVkIGpzb24gZmlsZSAtICR7cGF0aC5qb2luKGV4cG9ydFBhdGgsIGZpbGVOYW1lKX1gKVxyXG4gIGNvbmNlcmV0ZURhdGFiYXNlLmRyaXZlckluc3RhbmNlLmNsb3NlKClcclxufVxyXG5cclxuLyoqIFRoaXMgZnVuY3Rpb24gcmV3cml0ZXMgdGhlIGpzb24gZmlsZSAtIGFueSBtb2RpZmljYXRpb25zIHNob3VsZCBiZSBhZGRlZCBpbiB0aGUgZnVuY3Rpb24uXHJcbiAqIGB5YXJuIHJ1biBzY3JpcHRNYW5hZ2VyIHNob3VsZENvbXBpbGVTY3JpcHQ9dHJ1ZSBncmFwaERhdGFiYXNlL2V4cG9ydEdyYXBoRGF0YSBcIi5maXhKU09ORGF0YSh7IH0pXCJgXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZml4SlNPTkRhdGEoeyBhcGksIHRhcmdldFBhdGggPSAnLi9yZXNvdXJjZS8nLCBleHBvcnRlZEZpbGVOYW1lID0gJ2ZpeGVkLmV4cG9ydGVkLmpzb24nLCB0YXJnZXRGaWxlTmFtZSA9ICd0YXNrU2VxdWVuY2UuZ3JhcGhEYXRhLmpzb24nIH0gPSB7fSkge1xyXG4gIGNvbnN0IHRhcmdldFByb2plY3RSb290UGF0aCA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbi5kaXJlY3Rvcnkucm9vdFxyXG4gIGxldCBncmFwaERhdGEgPSByZXF1aXJlKHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdFBhdGgsIHRhcmdldFBhdGgsIHRhcmdldEZpbGVOYW1lKSlcclxuXHJcbiAgLy8gbW9kaWZ5IGRhdGFcclxuICBncmFwaERhdGEubm9kZSA9IGdyYXBoRGF0YS5ub2RlLm1hcChpdGVtID0+IHtcclxuICAgIC8vIGFkZCBrZXkgdG8gbm9kZXMgd2l0aG91dCBrZXlcclxuICAgIGlmICghaXRlbS5wcm9wZXJ0aWVzLmtleSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhg4oCiIEZpeGluZyBub2RlIHdpdGhvdXQga2V5IC0gYCArIEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxyXG4gICAgICBpdGVtLnByb3BlcnRpZXMua2V5ID0gdXVpZHY0KClcclxuICAgIH1cclxuICAgIHJldHVybiBpdGVtXHJcbiAgfSlcclxuICBncmFwaERhdGEuZWRnZSA9IGdyYXBoRGF0YS5lZGdlLm1hcChpdGVtID0+IHtcclxuICAgIC8vIGFkZCBrZXkgdG8gY29ubmVjdGlvbnMgd2l0aG91dCBrZXlcclxuICAgIGlmICghaXRlbS5wcm9wZXJ0aWVzLmtleSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhg4oCiIEZpeGluZyBlZGdlIHdpdGhvdXQga2V5IC0gYCArIEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxyXG4gICAgICBpdGVtLnByb3BlcnRpZXMua2V5ID0gdXVpZHY0KClcclxuICAgIH1cclxuICAgIHJldHVybiBpdGVtXHJcbiAgfSlcclxuXHJcbiAgY29uc3QgZXhwb3J0UGF0aCA9IHBhdGgubm9ybWFsaXplKHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdFBhdGgsIHRhcmdldFBhdGgsIGV4cG9ydGVkRmlsZU5hbWUpKVxyXG4gIGF3YWl0IGZpbGVzeXN0ZW0ud3JpdGVGaWxlKGV4cG9ydFBhdGgsIGdyYXBoRGF0YSB8PiBKU09OLnN0cmluZ2lmeSwgeyBlbmNvZGluZzogJ3V0ZjgnLCBmbGFnOiAndycgLyp0cnVjdGFjZSBmaWxlIGlmIGV4aXN0cyBhbmQgY3JlYXRlIGEgbmV3IG9uZSovIH0pXHJcbiAgY29uc29sZS5sb2coYOKAoiBDcmVhdGVkIGpzb24gZmlsZSAtICR7ZXhwb3J0UGF0aH1gKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJEYXRhYmFzZSh7IGNvbmNlcmV0ZURhdGFiYXNlLCB1cmwgPSB7IHByb3RvY29sOiAnYm9sdCcsIGhvc3RuYW1lOiAnbG9jYWxob3N0JywgcG9ydDogNzY4NyB9IH0pIHtcclxuICBpZiAoIWNvbmNlcmV0ZURhdGFiYXNlKSB7XHJcbiAgICBsZXQgY29uY3JldGVEYXRhYmFzZUJlaGF2aW9yID0gbmV3IERhdGFiYXNlLmNsaWVudEludGVyZmFjZSh7XHJcbiAgICAgIGltcGxlbWVudGF0aW9uTGlzdDogeyBib2x0Q3lwaGVyTW9kZWxBZGFwdGVyOiBpbXBsZW1lbnRhdGlvbi5kYXRhYmFzZS5ib2x0Q3lwaGVyTW9kZWxBZGFwdGVyRnVuY3Rpb24oeyB1cmwsIHNjaGVtZVJlZmVyZW5jZSB9KSB9LFxyXG4gICAgICBkZWZhdWx0SW1wbGVtZW50YXRpb246ICdib2x0Q3lwaGVyTW9kZWxBZGFwdGVyJyxcclxuICAgIH0pXHJcbiAgICBjb25jZXJldGVEYXRhYmFzZSA9IGNvbmNyZXRlRGF0YWJhc2VCZWhhdmlvcltEYXRhYmFzZS4kLmtleS5nZXR0ZXJdKClcclxuICB9XHJcblxyXG4gIC8vIERlbGV0ZSBhbGwgbm9kZXMgaW4gdGhlIGluLW1lbW9yeSBkYXRhYmFzZVxyXG4gIGNvbnN0IGdyYXBoREJEcml2ZXIgPSBjb25jZXJldGVEYXRhYmFzZS5kcml2ZXJJbnN0YW5jZVxyXG4gIGxldCBzZXNzaW9uID0gYXdhaXQgZ3JhcGhEQkRyaXZlci5zZXNzaW9uKClcclxuICBhd2FpdCBzZXNzaW9uLnJ1bihgbWF0Y2ggKG4pIGRldGFjaCBkZWxldGUgbmApXHJcbiAgY29uc29sZS5sb2coJ+KAoiBEYXRhYmFzZSBkYXRhIGNsZWFyZWQuJylcclxuICBzZXNzaW9uLmNsb3NlKClcclxufVxyXG4iXX0=