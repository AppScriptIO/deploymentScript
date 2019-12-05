"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.loadGraphDataFromFile = loadGraphDataFromFile;exports.exportAllGraphData = exportAllGraphData;exports.exportSpecificGraphData = exportSpecificGraphData;exports.fixJSONData = fixJSONData;exports.clearDatabase = clearDatabase;

var _path = _interopRequireDefault(require("path"));
var _assert = _interopRequireDefault(require("assert"));
var _fs = require("fs");
var _entity = require("@dependency/entity");
var _graphTraversal = require("@dependency/graphTraversal");

var _graphTraversalImplementation = require("@dependency/graphTraversal-implementation");const { Database } = _graphTraversal.Database;

const uuidv4 = require('uuid/v4');


function removeArrayDuplicateEdgeObject(array) {
  let unique = [];
  array.forEach(item => {
    if (!unique.some(i => i.identity == item.identity)) unique.push(item);
  });
  return unique;
}

async function loadGraphDataFromFile({ api, shouldClearDatabase = false, graphDataFilePath, url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } } = {}) {
  let concreteDatabaseBehavior = new Database.clientInterface({
    implementationList: { boltCypherModelAdapter: _graphTraversalImplementation.database.boltCypherModelAdapterFunction({ url, schemeReference: _graphTraversal.schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter' });

  let concereteDatabaseInstance = concreteDatabaseBehavior[_entity.Entity.reference.getInstanceOf](Database);
  let concereteDatabase = concereteDatabaseInstance[Database.reference.key.getter]();

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
  let concreteDatabaseBehavior = new Database.clientInterface({
    implementationList: { boltCypherModelAdapter: _graphTraversalImplementation.database.boltCypherModelAdapterFunction({ url, schemeReference: _graphTraversal.schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter' });

  let concereteDatabaseInstance = concreteDatabaseBehavior[_entity.Entity.reference.getInstanceOf](Database);
  let concereteDatabase = concereteDatabaseInstance[Database.reference.key.getter]();

  const targetProjectRootPath = api.project.configuration.configuration.directory.root;
  const exportPath = _path.default.normalize(_path.default.join(targetProjectRootPath, targetPath));
  let graphData = (_node$edge = { node: await concereteDatabase.getAllNode(), edge: await concereteDatabase.getAllEdge() }, JSON.stringify(_node$edge));

  if (!(0, _fs.existsSync)(exportPath)) (0, _fs.mkdirSync)(exportPath, { recursive: true });
  await _fs.promises.writeFile(_path.default.join(exportPath, fileName), graphData, { encoding: 'utf8', flag: 'w' });
  console.log(`• Created json file - ${_path.default.join(exportPath, fileName)}`);

  if (fixGraphData) await fixJSONData({ api, targetPath, exportedFileName: fileName, targetFileName: fileName, url });

  concereteDatabase.driverInstance.close();
}

async function exportSpecificGraphData({ api, targetPath = './test/asset/', fileName = 'specific.exported.json', url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } } = {}) {var _node$edge2;
  let concreteDatabaseBehavior = new Database.clientInterface({
    implementationList: { boltCypherModelAdapter: _graphTraversalImplementation.database.boltCypherModelAdapterFunction({ url, schemeReference: _graphTraversal.schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter' });

  let concereteDatabaseInstance = concreteDatabaseBehavior[_entity.Entity.reference.getInstanceOf](Database);
  let concereteDatabase = concereteDatabaseInstance[Database.reference.key.getter]();

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

  edgeArray = removeArrayDuplicateEdgeObject(edgeArray);

  let graphData = (_node$edge2 = { node: nodeArray, edge: edgeArray }, JSON.stringify(_node$edge2));
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
    let concreteDatabaseBehavior = new Database.clientInterface({
      implementationList: { boltCypherModelAdapter: _graphTraversalImplementation.database.boltCypherModelAdapterFunction({ url, schemeReference: _graphTraversal.schemeReference }) },
      defaultImplementation: 'boltCypherModelAdapter' });

    let concereteDatabaseInstance = concreteDatabaseBehavior[_entity.Entity.reference.getInstanceOf](Database);
    concereteDatabase = concereteDatabaseInstance[Database.reference.key.getter]();
  }


  const graphDBDriver = concereteDatabase.driverInstance;
  let session = await graphDBDriver.session();
  await session.run(`match (n) detach delete n`);
  console.log('• Database data cleared.');
  session.close();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9ncmFwaERhdGFiYXNlL2dyYXBoRGF0YUxvYWRpbmcuanMiXSwibmFtZXMiOlsiRGF0YWJhc2UiLCJEYXRhYmFzZU1vZHVsZSIsInV1aWR2NCIsInJlcXVpcmUiLCJyZW1vdmVBcnJheUR1cGxpY2F0ZUVkZ2VPYmplY3QiLCJhcnJheSIsInVuaXF1ZSIsImZvckVhY2giLCJpdGVtIiwic29tZSIsImkiLCJpZGVudGl0eSIsInB1c2giLCJsb2FkR3JhcGhEYXRhRnJvbUZpbGUiLCJhcGkiLCJzaG91bGRDbGVhckRhdGFiYXNlIiwiZ3JhcGhEYXRhRmlsZVBhdGgiLCJ1cmwiLCJwcm90b2NvbCIsImhvc3RuYW1lIiwicG9ydCIsImNvbmNyZXRlRGF0YWJhc2VCZWhhdmlvciIsImNsaWVudEludGVyZmFjZSIsImltcGxlbWVudGF0aW9uTGlzdCIsImJvbHRDeXBoZXJNb2RlbEFkYXB0ZXIiLCJkYXRhYmFzZSIsImJvbHRDeXBoZXJNb2RlbEFkYXB0ZXJGdW5jdGlvbiIsInNjaGVtZVJlZmVyZW5jZSIsImRlZmF1bHRJbXBsZW1lbnRhdGlvbiIsImNvbmNlcmV0ZURhdGFiYXNlSW5zdGFuY2UiLCJFbnRpdHkiLCJyZWZlcmVuY2UiLCJnZXRJbnN0YW5jZU9mIiwiY29uY2VyZXRlRGF0YWJhc2UiLCJrZXkiLCJnZXR0ZXIiLCJ0YXJnZXRQcm9qZWN0Um9vdFBhdGgiLCJwcm9qZWN0IiwiY29uZmlndXJhdGlvbiIsImRpcmVjdG9yeSIsInJvb3QiLCJjbGVhckRhdGFiYXNlIiwiYWJzb2x1dGVQYXRoIiwicGF0aCIsImlzQWJzb2x1dGUiLCJqb2luIiwiZ3JhcGhEYXRhIiwiQXJyYXkiLCJpc0FycmF5Iiwibm9kZSIsImVkZ2UiLCJsb2FkR3JhcGhEYXRhIiwibm9kZUVudHJ5RGF0YSIsImNvbm5lY3Rpb25FbnRyeURhdGEiLCJkcml2ZXJJbnN0YW5jZSIsImNsb3NlIiwiZXhwb3J0QWxsR3JhcGhEYXRhIiwidGFyZ2V0UGF0aCIsImZpbGVOYW1lIiwiZml4R3JhcGhEYXRhIiwiZXhwb3J0UGF0aCIsIm5vcm1hbGl6ZSIsImdldEFsbE5vZGUiLCJnZXRBbGxFZGdlIiwiSlNPTiIsInN0cmluZ2lmeSIsInJlY3Vyc2l2ZSIsImZpbGVzeXN0ZW0iLCJ3cml0ZUZpbGUiLCJlbmNvZGluZyIsImZsYWciLCJjb25zb2xlIiwibG9nIiwiZml4SlNPTkRhdGEiLCJleHBvcnRlZEZpbGVOYW1lIiwidGFyZ2V0RmlsZU5hbWUiLCJleHBvcnRTcGVjaWZpY0dyYXBoRGF0YSIsIm5vZGVLZXlBcnJheSIsIm5vZGVBcnJheSIsImVkZ2VBcnJheSIsImdldE5vZGVCeUtleSIsInF1ZXJ5UmVzdWx0QXJyYXkiLCJnZXROb2RlQ29ubmVjdGlvbiIsIm5vZGVJRCIsIm1hcCIsInJlc3VsdCIsImNvbm5lY3Rpb24iLCJmaWx0ZXIiLCJzdGFydCIsImVuZCIsInByb3BlcnRpZXMiLCJncmFwaERCRHJpdmVyIiwic2Vzc2lvbiIsInJ1biJdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHlGQURBLE1BQU0sRUFBRUEsUUFBRixLQUFlQyx3QkFBckI7O0FBR0EsTUFBTUMsTUFBTSxHQUFHQyxPQUFPLENBQUMsU0FBRCxDQUF0Qjs7O0FBR0EsU0FBU0MsOEJBQVQsQ0FBd0NDLEtBQXhDLEVBQStDO0FBQzdDLE1BQUlDLE1BQU0sR0FBRyxFQUFiO0FBQ0FELEVBQUFBLEtBQUssQ0FBQ0UsT0FBTixDQUFjQyxJQUFJLElBQUk7QUFDcEIsUUFBSSxDQUFDRixNQUFNLENBQUNHLElBQVAsQ0FBWUMsQ0FBQyxJQUFJQSxDQUFDLENBQUNDLFFBQUYsSUFBY0gsSUFBSSxDQUFDRyxRQUFwQyxDQUFMLEVBQW9ETCxNQUFNLENBQUNNLElBQVAsQ0FBWUosSUFBWjtBQUNyRCxHQUZEO0FBR0EsU0FBT0YsTUFBUDtBQUNEOztBQUVNLGVBQWVPLHFCQUFmLENBQXFDLEVBQUVDLEdBQUYsRUFBOEJDLG1CQUFtQixHQUFHLEtBQXBELEVBQTJEQyxp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LHdCQUZtQyxFQUE3QixDQUEvQjs7QUFJQSxRQUFJQyx5QkFBeUIsR0FBR1Isd0JBQXdCLENBQUNTLGVBQU9DLFNBQVAsQ0FBaUJDLGFBQWxCLENBQXhCLENBQXlEaEMsUUFBekQsQ0FBaEM7QUFDQWlDLElBQUFBLGlCQUFpQixHQUFHSix5QkFBeUIsQ0FBQzdCLFFBQVEsQ0FBQytCLFNBQVQsQ0FBbUJHLEdBQW5CLENBQXVCQyxNQUF4QixDQUF6QixFQUFwQjtBQUNEOzs7QUFHRCxRQUFNd0QsYUFBYSxHQUFHMUQsaUJBQWlCLENBQUNxQixjQUF4QztBQUNBLE1BQUlzQyxPQUFPLEdBQUcsTUFBTUQsYUFBYSxDQUFDQyxPQUFkLEVBQXBCO0FBQ0EsUUFBTUEsT0FBTyxDQUFDQyxHQUFSLENBQWEsMkJBQWIsQ0FBTjtBQUNBdEIsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMEJBQVo7QUFDQW9CLEVBQUFBLE9BQU8sQ0FBQ3JDLEtBQVI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIHByb2R1Y2UganNvbiBncmFwaCBkYXRhIGZyb20gZGF0YWJhc2UgcXVlcmllc1xyXG5cclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnXHJcbmltcG9ydCB7IHByb21pc2VzIGFzIGZpbGVzeXN0ZW0sIGV4aXN0c1N5bmMsIG1rZGlyU3luYyB9IGZyb20gJ2ZzJ1xyXG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICdAZGVwZW5kZW5jeS9lbnRpdHknXHJcbmltcG9ydCB7IERhdGFiYXNlIGFzIERhdGFiYXNlTW9kdWxlLCBzY2hlbWVSZWZlcmVuY2UgfSBmcm9tICdAZGVwZW5kZW5jeS9ncmFwaFRyYXZlcnNhbCdcclxuY29uc3QgeyBEYXRhYmFzZSB9ID0gRGF0YWJhc2VNb2R1bGVcclxuaW1wb3J0IHsgZGF0YWJhc2UgfSBmcm9tICdAZGVwZW5kZW5jeS9ncmFwaFRyYXZlcnNhbC1pbXBsZW1lbnRhdGlvbidcclxuaW1wb3J0IHsgZmlsZSB9IGZyb20gJ2JhYmVsLXR5cGVzJ1xyXG5jb25zdCB1dWlkdjQgPSByZXF1aXJlKCd1dWlkL3Y0JylcclxuXHJcbi8vIHJlbW92ZSBkdXBsaWNhdGUgb2JqZWN0cyBmcm9tIGFycmF5IHVzaW5nIHRoZSBpZGVudGl0eSBwcm9wZXJ0eSB0byBjaGVjayBlcXVhbGl0eVxyXG5mdW5jdGlvbiByZW1vdmVBcnJheUR1cGxpY2F0ZUVkZ2VPYmplY3QoYXJyYXkpIHtcclxuICBsZXQgdW5pcXVlID0gW11cclxuICBhcnJheS5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgaWYgKCF1bmlxdWUuc29tZShpID0+IGkuaWRlbnRpdHkgPT0gaXRlbS5pZGVudGl0eSkpIHVuaXF1ZS5wdXNoKGl0ZW0pXHJcbiAgfSlcclxuICByZXR1cm4gdW5pcXVlXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkR3JhcGhEYXRhRnJvbUZpbGUoeyBhcGkgLyoqc2NyaXB0TWFuYWdlciBhcGkqLywgc2hvdWxkQ2xlYXJEYXRhYmFzZSA9IGZhbHNlLCBncmFwaERhdGFGaWxlUGF0aCwgdXJsID0geyBwcm90b2NvbDogJ2JvbHQnLCBob3N0bmFtZTogJ2xvY2FsaG9zdCcsIHBvcnQ6IDc2ODcgfSB9ID0ge30pIHtcclxuICBsZXQgY29uY3JldGVEYXRhYmFzZUJlaGF2aW9yID0gbmV3IERhdGFiYXNlLmNsaWVudEludGVyZmFjZSh7XHJcbiAgICBpbXBsZW1lbnRhdGlvbkxpc3Q6IHsgYm9sdEN5cGhlck1vZGVsQWRhcHRlcjogZGF0YWJhc2UuYm9sdEN5cGhlck1vZGVsQWRhcHRlckZ1bmN0aW9uKHsgdXJsLCBzY2hlbWVSZWZlcmVuY2UgfSkgfSxcclxuICAgIGRlZmF1bHRJbXBsZW1lbnRhdGlvbjogJ2JvbHRDeXBoZXJNb2RlbEFkYXB0ZXInLFxyXG4gIH0pXHJcbiAgbGV0IGNvbmNlcmV0ZURhdGFiYXNlSW5zdGFuY2UgPSBjb25jcmV0ZURhdGFiYXNlQmVoYXZpb3JbRW50aXR5LnJlZmVyZW5jZS5nZXRJbnN0YW5jZU9mXShEYXRhYmFzZSlcclxuICBsZXQgY29uY2VyZXRlRGF0YWJhc2UgPSBjb25jZXJldGVEYXRhYmFzZUluc3RhbmNlW0RhdGFiYXNlLnJlZmVyZW5jZS5rZXkuZ2V0dGVyXSgpXHJcblxyXG4gIGFzc2VydChncmFwaERhdGFGaWxlUGF0aCwgYOKAoiBncmFwaERhdGFGaWxlUGF0aCBtdXN0IGJlIHBhc3NlZCB0byBzY3JpcHQgLSAke2dyYXBoRGF0YUZpbGVQYXRofWApXHJcbiAgY29uc3QgdGFyZ2V0UHJvamVjdFJvb3RQYXRoID0gYXBpLnByb2plY3QuY29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9uLmRpcmVjdG9yeS5yb290XHJcbiAgaWYgKHNob3VsZENsZWFyRGF0YWJhc2UpIGF3YWl0IGNsZWFyRGF0YWJhc2UoeyBjb25jZXJldGVEYXRhYmFzZSwgdXJsIH0pXHJcbiAgbGV0IGFic29sdXRlUGF0aCA9IHBhdGguaXNBYnNvbHV0ZShncmFwaERhdGFGaWxlUGF0aCkgPyBncmFwaERhdGFGaWxlUGF0aCA6IHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdFBhdGgsIGdyYXBoRGF0YUZpbGVQYXRoKVxyXG4gIGxldCBncmFwaERhdGEgPSByZXF1aXJlKGFic29sdXRlUGF0aClcclxuICBhc3NlcnQoQXJyYXkuaXNBcnJheShncmFwaERhdGEubm9kZSkgJiYgQXJyYXkuaXNBcnJheShncmFwaERhdGEuZWRnZSksIGDigKIgVW5zdXBwb3J0ZWQgZ3JhcGggZGF0YSBzdHJjdXR1cmUtICR7Z3JhcGhEYXRhLmVkZ2V9IC0gJHtncmFwaERhdGEubm9kZX1gKVxyXG4gIGF3YWl0IGNvbmNlcmV0ZURhdGFiYXNlLmxvYWRHcmFwaERhdGEoeyBub2RlRW50cnlEYXRhOiBncmFwaERhdGEubm9kZSwgY29ubmVjdGlvbkVudHJ5RGF0YTogZ3JhcGhEYXRhLmVkZ2UgfSlcclxuICBjb25jZXJldGVEYXRhYmFzZS5kcml2ZXJJbnN0YW5jZS5jbG9zZSgpXHJcbn1cclxuXHJcbi8vIFJlbGllcyBvbiB0aGUgaW50ZXJmYWNlIGZvciBjb25jcmV0ZSBkYXRhYmFzZSBwbHVnaW5zIG9mIGdyYXBoVHJhdmVyc2FsIG1vZHVsZS5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydEFsbEdyYXBoRGF0YSh7XHJcbiAgYXBpLFxyXG4gIHRhcmdldFBhdGggPSAnLi90ZXN0L2Fzc2V0LycsXHJcbiAgZmlsZU5hbWUgPSAnZ3JhcGhEYXRhLmV4cG9ydGVkLmpzb24nLFxyXG4gIHVybCA9IHsgcHJvdG9jb2w6ICdib2x0JywgaG9zdG5hbWU6ICdsb2NhbGhvc3QnLCBwb3J0OiA3Njg3IH0sXHJcbiAgZml4R3JhcGhEYXRhID0gdHJ1ZSxcclxufSA9IHt9KSB7XHJcbiAgbGV0IGNvbmNyZXRlRGF0YWJhc2VCZWhhdmlvciA9IG5ldyBEYXRhYmFzZS5jbGllbnRJbnRlcmZhY2Uoe1xyXG4gICAgaW1wbGVtZW50YXRpb25MaXN0OiB7IGJvbHRDeXBoZXJNb2RlbEFkYXB0ZXI6IGRhdGFiYXNlLmJvbHRDeXBoZXJNb2RlbEFkYXB0ZXJGdW5jdGlvbih7IHVybCwgc2NoZW1lUmVmZXJlbmNlIH0pIH0sXHJcbiAgICBkZWZhdWx0SW1wbGVtZW50YXRpb246ICdib2x0Q3lwaGVyTW9kZWxBZGFwdGVyJyxcclxuICB9KVxyXG4gIGxldCBjb25jZXJldGVEYXRhYmFzZUluc3RhbmNlID0gY29uY3JldGVEYXRhYmFzZUJlaGF2aW9yW0VudGl0eS5yZWZlcmVuY2UuZ2V0SW5zdGFuY2VPZl0oRGF0YWJhc2UpXHJcbiAgbGV0IGNvbmNlcmV0ZURhdGFiYXNlID0gY29uY2VyZXRlRGF0YWJhc2VJbnN0YW5jZVtEYXRhYmFzZS5yZWZlcmVuY2Uua2V5LmdldHRlcl0oKVxyXG5cclxuICBjb25zdCB0YXJnZXRQcm9qZWN0Um9vdFBhdGggPSBhcGkucHJvamVjdC5jb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb24uZGlyZWN0b3J5LnJvb3RcclxuICBjb25zdCBleHBvcnRQYXRoID0gcGF0aC5ub3JtYWxpemUocGF0aC5qb2luKHRhcmdldFByb2plY3RSb290UGF0aCwgdGFyZ2V0UGF0aCkpXHJcbiAgbGV0IGdyYXBoRGF0YSA9IHsgbm9kZTogYXdhaXQgY29uY2VyZXRlRGF0YWJhc2UuZ2V0QWxsTm9kZSgpLCBlZGdlOiBhd2FpdCBjb25jZXJldGVEYXRhYmFzZS5nZXRBbGxFZGdlKCkgfSB8PiBKU09OLnN0cmluZ2lmeVxyXG5cclxuICBpZiAoIWV4aXN0c1N5bmMoZXhwb3J0UGF0aCkpIG1rZGlyU3luYyhleHBvcnRQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KSAvLyBjcmVhdGUgYmFzZSBkaXJlY3RvcnkgaWYgaXQgZG9lc24ndCBleGlzdFxyXG4gIGF3YWl0IGZpbGVzeXN0ZW0ud3JpdGVGaWxlKHBhdGguam9pbihleHBvcnRQYXRoLCBmaWxlTmFtZSksIGdyYXBoRGF0YSwgeyBlbmNvZGluZzogJ3V0ZjgnLCBmbGFnOiAndycgLyp0cnVjdGFjZSBmaWxlIGlmIGV4aXN0cyBhbmQgY3JlYXRlIGEgbmV3IG9uZSovIH0pXHJcbiAgY29uc29sZS5sb2coYOKAoiBDcmVhdGVkIGpzb24gZmlsZSAtICR7cGF0aC5qb2luKGV4cG9ydFBhdGgsIGZpbGVOYW1lKX1gKVxyXG5cclxuICBpZiAoZml4R3JhcGhEYXRhKSBhd2FpdCBmaXhKU09ORGF0YSh7IGFwaSwgdGFyZ2V0UGF0aCwgZXhwb3J0ZWRGaWxlTmFtZTogZmlsZU5hbWUsIHRhcmdldEZpbGVOYW1lOiBmaWxlTmFtZSwgdXJsIH0pIC8vIEZvciBub2RlcyBsYWtpbmcga2V5cywgZ2VuZXJhdGUgcmFuZG9tIGtleXMuXHJcblxyXG4gIGNvbmNlcmV0ZURhdGFiYXNlLmRyaXZlckluc3RhbmNlLmNsb3NlKClcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFNwZWNpZmljR3JhcGhEYXRhKHsgYXBpLCB0YXJnZXRQYXRoID0gJy4vdGVzdC9hc3NldC8nLCBmaWxlTmFtZSA9ICdzcGVjaWZpYy5leHBvcnRlZC5qc29uJywgdXJsID0geyBwcm90b2NvbDogJ2JvbHQnLCBob3N0bmFtZTogJ2xvY2FsaG9zdCcsIHBvcnQ6IDc2ODcgfSB9ID0ge30pIHtcclxuICBsZXQgY29uY3JldGVEYXRhYmFzZUJlaGF2aW9yID0gbmV3IERhdGFiYXNlLmNsaWVudEludGVyZmFjZSh7XHJcbiAgICBpbXBsZW1lbnRhdGlvbkxpc3Q6IHsgYm9sdEN5cGhlck1vZGVsQWRhcHRlcjogZGF0YWJhc2UuYm9sdEN5cGhlck1vZGVsQWRhcHRlckZ1bmN0aW9uKHsgdXJsLCBzY2hlbWVSZWZlcmVuY2UgfSkgfSxcclxuICAgIGRlZmF1bHRJbXBsZW1lbnRhdGlvbjogJ2JvbHRDeXBoZXJNb2RlbEFkYXB0ZXInLFxyXG4gIH0pXHJcbiAgbGV0IGNvbmNlcmV0ZURhdGFiYXNlSW5zdGFuY2UgPSBjb25jcmV0ZURhdGFiYXNlQmVoYXZpb3JbRW50aXR5LnJlZmVyZW5jZS5nZXRJbnN0YW5jZU9mXShEYXRhYmFzZSlcclxuICBsZXQgY29uY2VyZXRlRGF0YWJhc2UgPSBjb25jZXJldGVEYXRhYmFzZUluc3RhbmNlW0RhdGFiYXNlLnJlZmVyZW5jZS5rZXkuZ2V0dGVyXSgpXHJcblxyXG4gIGNvbnN0IHRhcmdldFByb2plY3RSb290UGF0aCA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbi5kaXJlY3Rvcnkucm9vdFxyXG4gIGNvbnN0IGV4cG9ydFBhdGggPSBwYXRoLm5vcm1hbGl6ZShwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3RQYXRoLCB0YXJnZXRQYXRoKSlcclxuXHJcbiAgLy8gcHJvdmlkZSBsaXN0IG9mIG5vZGUga2V5cyB0byBleHBvcnQgKG5vZGVzIHdpbGwgYmUgZXhwb3J0ZWQgd2l0aCB0aGVpciBjb25uZWN0aW9ucyByZWxhdGVkIHRvIHRoZSBzcGVjaWZpYyBub2RlcyBvbmx5KVxyXG4gIGxldCBub2RlS2V5QXJyYXkgPSBbXHJcbiAgICAvLyBsaXN0IG9mIG5vZGUga2V5cyB0byBleHBvcnQuXHJcbiAgXVxyXG4gIGxldCBub2RlQXJyYXkgPSBbXSxcclxuICAgIGVkZ2VBcnJheSA9IFtdXHJcblxyXG4gIC8vIGdldCBub2Rlc1xyXG4gIGZvciAobGV0IGtleSBvZiBub2RlS2V5QXJyYXkpIG5vZGVBcnJheS5wdXNoKGF3YWl0IGNvbmNlcmV0ZURhdGFiYXNlLmdldE5vZGVCeUtleSh7IGtleSB9KSlcclxuXHJcbiAgLy8gZ2V0IHRoZSBjb25uZWN0aW9ucyBiZXR3ZWVuIHRoZSBub2Rlc1xyXG4gIGZvciAobGV0IG5vZGUgb2Ygbm9kZUFycmF5KSB7XHJcbiAgICBsZXQgcXVlcnlSZXN1bHRBcnJheSA9IGF3YWl0IGNvbmNlcmV0ZURhdGFiYXNlLmdldE5vZGVDb25uZWN0aW9uKHsgbm9kZUlEOiBub2RlLmlkZW50aXR5IH0pXHJcbiAgICBxdWVyeVJlc3VsdEFycmF5ID0gcXVlcnlSZXN1bHRBcnJheS5tYXAocmVzdWx0ID0+IHJlc3VsdC5jb25uZWN0aW9uKSAvLyBnZXQgdGhlIGNvbm5lY3Rpb25zIG9ubHkgd2l0aG91dCB0aGUgZGVzdGluYXRpb24gYW5kIHNvdXJjZSBub2Rlc1xyXG4gICAgZWRnZUFycmF5ID0gWy4uLmVkZ2VBcnJheSwgLi4ucXVlcnlSZXN1bHRBcnJheV1cclxuICB9XHJcbiAgLy8gZmlsdGVyIGVkZ2VzIG9mIHRoZSBzcGVjaWZpYyBub2RlcyBvbmx5XHJcbiAgZWRnZUFycmF5ID0gZWRnZUFycmF5LmZpbHRlcihlZGdlID0+IG5vZGVBcnJheS5zb21lKG5vZGUgPT4gbm9kZS5pZGVudGl0eSA9PSBlZGdlLnN0YXJ0KSAmJiBub2RlQXJyYXkuc29tZShub2RlID0+IG5vZGUuaWRlbnRpdHkgPT0gZWRnZS5lbmQpKVxyXG4gIC8vIGZpbHRlciBkdXBsaWNhdGVzXHJcbiAgZWRnZUFycmF5ID0gcmVtb3ZlQXJyYXlEdXBsaWNhdGVFZGdlT2JqZWN0KGVkZ2VBcnJheSlcclxuXHJcbiAgbGV0IGdyYXBoRGF0YSA9IHsgbm9kZTogbm9kZUFycmF5LCBlZGdlOiBlZGdlQXJyYXkgfSB8PiBKU09OLnN0cmluZ2lmeVxyXG4gIGF3YWl0IGZpbGVzeXN0ZW0ud3JpdGVGaWxlKHBhdGguam9pbihleHBvcnRQYXRoLCBmaWxlTmFtZSksIGdyYXBoRGF0YSwgeyBlbmNvZGluZzogJ3V0ZjgnLCBmbGFnOiAndycgLyp0cnVjdGFjZSBmaWxlIGlmIGV4aXN0cyBhbmQgY3JlYXRlIGEgbmV3IG9uZSovIH0pXHJcbiAgY29uc29sZS5sb2coYOKAoiBDcmVhdGVkIGpzb24gZmlsZSAtICR7cGF0aC5qb2luKGV4cG9ydFBhdGgsIGZpbGVOYW1lKX1gKVxyXG4gIGNvbmNlcmV0ZURhdGFiYXNlLmRyaXZlckluc3RhbmNlLmNsb3NlKClcclxufVxyXG5cclxuLyoqIFRoaXMgZnVuY3Rpb24gcmV3cml0ZXMgdGhlIGpzb24gZmlsZSAtIGFueSBtb2RpZmljYXRpb25zIHNob3VsZCBiZSBhZGRlZCBpbiB0aGUgZnVuY3Rpb24uXHJcbiAqIGB5YXJuIHJ1biBzY3JpcHRNYW5hZ2VyIHNob3VsZENvbXBpbGVTY3JpcHQ9dHJ1ZSBncmFwaERhdGFiYXNlL2V4cG9ydEdyYXBoRGF0YSBcIi5maXhKU09ORGF0YSh7IH0pXCJgXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZml4SlNPTkRhdGEoeyBhcGksIHRhcmdldFBhdGggPSAnLi9yZXNvdXJjZS8nLCBleHBvcnRlZEZpbGVOYW1lID0gJ2ZpeGVkLmV4cG9ydGVkLmpzb24nLCB0YXJnZXRGaWxlTmFtZSA9ICd0YXNrU2VxdWVuY2UuZ3JhcGhEYXRhLmpzb24nIH0gPSB7fSkge1xyXG4gIGNvbnN0IHRhcmdldFByb2plY3RSb290UGF0aCA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbi5kaXJlY3Rvcnkucm9vdFxyXG4gIGxldCBncmFwaERhdGEgPSByZXF1aXJlKHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdFBhdGgsIHRhcmdldFBhdGgsIHRhcmdldEZpbGVOYW1lKSlcclxuXHJcbiAgLy8gbW9kaWZ5IGRhdGFcclxuICBncmFwaERhdGEubm9kZSA9IGdyYXBoRGF0YS5ub2RlLm1hcChpdGVtID0+IHtcclxuICAgIC8vIGFkZCBrZXkgdG8gbm9kZXMgd2l0aG91dCBrZXlcclxuICAgIGlmICghaXRlbS5wcm9wZXJ0aWVzLmtleSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhg4oCiIEZpeGluZyBub2RlIHdpdGhvdXQga2V5IC0gYCArIEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxyXG4gICAgICBpdGVtLnByb3BlcnRpZXMua2V5ID0gdXVpZHY0KClcclxuICAgIH1cclxuICAgIHJldHVybiBpdGVtXHJcbiAgfSlcclxuICBncmFwaERhdGEuZWRnZSA9IGdyYXBoRGF0YS5lZGdlLm1hcChpdGVtID0+IHtcclxuICAgIC8vIGFkZCBrZXkgdG8gY29ubmVjdGlvbnMgd2l0aG91dCBrZXlcclxuICAgIGlmICghaXRlbS5wcm9wZXJ0aWVzLmtleSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhg4oCiIEZpeGluZyBlZGdlIHdpdGhvdXQga2V5IC0gYCArIEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxyXG4gICAgICBpdGVtLnByb3BlcnRpZXMua2V5ID0gdXVpZHY0KClcclxuICAgIH1cclxuICAgIHJldHVybiBpdGVtXHJcbiAgfSlcclxuXHJcbiAgY29uc3QgZXhwb3J0UGF0aCA9IHBhdGgubm9ybWFsaXplKHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdFBhdGgsIHRhcmdldFBhdGgsIGV4cG9ydGVkRmlsZU5hbWUpKVxyXG4gIGF3YWl0IGZpbGVzeXN0ZW0ud3JpdGVGaWxlKGV4cG9ydFBhdGgsIGdyYXBoRGF0YSB8PiBKU09OLnN0cmluZ2lmeSwgeyBlbmNvZGluZzogJ3V0ZjgnLCBmbGFnOiAndycgLyp0cnVjdGFjZSBmaWxlIGlmIGV4aXN0cyBhbmQgY3JlYXRlIGEgbmV3IG9uZSovIH0pXHJcbiAgY29uc29sZS5sb2coYOKAoiBDcmVhdGVkIGpzb24gZmlsZSAtICR7ZXhwb3J0UGF0aH1gKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJEYXRhYmFzZSh7IGNvbmNlcmV0ZURhdGFiYXNlLCB1cmwgPSB7IHByb3RvY29sOiAnYm9sdCcsIGhvc3RuYW1lOiAnbG9jYWxob3N0JywgcG9ydDogNzY4NyB9IH0pIHtcclxuICBpZiAoIWNvbmNlcmV0ZURhdGFiYXNlKSB7XHJcbiAgICBsZXQgY29uY3JldGVEYXRhYmFzZUJlaGF2aW9yID0gbmV3IERhdGFiYXNlLmNsaWVudEludGVyZmFjZSh7XHJcbiAgICAgIGltcGxlbWVudGF0aW9uTGlzdDogeyBib2x0Q3lwaGVyTW9kZWxBZGFwdGVyOiBkYXRhYmFzZS5ib2x0Q3lwaGVyTW9kZWxBZGFwdGVyRnVuY3Rpb24oeyB1cmwsIHNjaGVtZVJlZmVyZW5jZSB9KSB9LFxyXG4gICAgICBkZWZhdWx0SW1wbGVtZW50YXRpb246ICdib2x0Q3lwaGVyTW9kZWxBZGFwdGVyJyxcclxuICAgIH0pXHJcbiAgICBsZXQgY29uY2VyZXRlRGF0YWJhc2VJbnN0YW5jZSA9IGNvbmNyZXRlRGF0YWJhc2VCZWhhdmlvcltFbnRpdHkucmVmZXJlbmNlLmdldEluc3RhbmNlT2ZdKERhdGFiYXNlKVxyXG4gICAgY29uY2VyZXRlRGF0YWJhc2UgPSBjb25jZXJldGVEYXRhYmFzZUluc3RhbmNlW0RhdGFiYXNlLnJlZmVyZW5jZS5rZXkuZ2V0dGVyXSgpXHJcbiAgfVxyXG5cclxuICAvLyBEZWxldGUgYWxsIG5vZGVzIGluIHRoZSBpbi1tZW1vcnkgZGF0YWJhc2VcclxuICBjb25zdCBncmFwaERCRHJpdmVyID0gY29uY2VyZXRlRGF0YWJhc2UuZHJpdmVySW5zdGFuY2VcclxuICBsZXQgc2Vzc2lvbiA9IGF3YWl0IGdyYXBoREJEcml2ZXIuc2Vzc2lvbigpXHJcbiAgYXdhaXQgc2Vzc2lvbi5ydW4oYG1hdGNoIChuKSBkZXRhY2ggZGVsZXRlIG5gKVxyXG4gIGNvbnNvbGUubG9nKCfigKIgRGF0YWJhc2UgZGF0YSBjbGVhcmVkLicpXHJcbiAgc2Vzc2lvbi5jbG9zZSgpXHJcbn1cclxuIl19