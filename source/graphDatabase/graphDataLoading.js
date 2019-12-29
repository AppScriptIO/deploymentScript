// produce json graph data from database queries

import path from 'path'
import assert from 'assert'
import { promises as filesystem, existsSync, mkdirSync } from 'fs'
import { Entity } from '@dependency/entity'
import { Database, schemeReference } from '@dependency/graphTraversal'
import * as implementation from '@dependency/graphTraversal-implementation'
import { file } from 'babel-types'
const uuidv4 = require('uuid/v4')

// remove duplicate objects from array using the identity property to check equality
function removeArrayDuplicateObjectByIdentity(array) {
  let unique = []
  array.forEach(item => {
    if (!unique.some(i => i.identity == item.identity)) unique.push(item)
  })
  return unique
}

export async function loadGraphDataFromFile({ api /**scriptManager api*/, shouldClearDatabase = false, graphDataFilePath, url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } } = {}) {
  let concreteDatabaseBehavior = new Database.clientInterface({
    implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter',
  })
  let concereteDatabase = concreteDatabaseBehavior[Database.$.key.getter]()

  assert(graphDataFilePath, `• graphDataFilePath must be passed to script - ${graphDataFilePath}`)
  const targetProjectRootPath = api.project.configuration.configuration.directory.root
  if (shouldClearDatabase) await clearDatabase({ concereteDatabase, url })
  let absolutePath = path.isAbsolute(graphDataFilePath) ? graphDataFilePath : path.join(targetProjectRootPath, graphDataFilePath)
  let graphData = require(absolutePath)
  assert(Array.isArray(graphData.node) && Array.isArray(graphData.edge), `• Unsupported graph data strcuture- ${graphData.edge} - ${graphData.node}`)
  await concereteDatabase.loadGraphData({ nodeEntryData: graphData.node, connectionEntryData: graphData.edge })
  concereteDatabase.driverInstance.close()
}

// Relies on the interface for concrete database plugins of graphTraversal module.
export async function exportAllGraphData({
  api,
  targetPath = './test/asset/',
  fileName = 'graphData.exported.json',
  url = { protocol: 'bolt', hostname: 'localhost', port: 7687 },
  fixGraphData = true,
} = {}) {
  let concreteDatabaseBehavior = new Database.clientInterface({
    implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter',
  })
  let concereteDatabase = concreteDatabaseBehavior[Database.$.key.getter]()

  const targetProjectRootPath = api.project.configuration.configuration.directory.root
  const exportPath = path.normalize(path.join(targetProjectRootPath, targetPath))

  let graphData = { node: await concereteDatabase.getAllNode(), edge: await concereteDatabase.getAllEdge() } |> JSON.stringify

  if (!existsSync(exportPath)) mkdirSync(exportPath, { recursive: true }) // create base directory if it doesn't exist
  await filesystem.writeFile(path.join(exportPath, fileName), graphData, { encoding: 'utf8', flag: 'w' /*tructace file if exists and create a new one*/ })
  console.log(`• Created json file - ${path.join(exportPath, fileName)}`)

  if (fixGraphData) await fixJSONData({ api, targetPath, exportedFileName: fileName, targetFileName: fileName, url }) // For nodes laking keys, generate random keys.

  concereteDatabase.driverInstance.close()
}

// Export subgraphs through specifying entrypoints which will recursively traverse through neighboring nodes and add them.
export async function exportSubgraphData({
  api,
  subgraphEntryNodeKeyList = [],
  targetPath = './test/asset/',
  fileName = 'specific.exported.json',
  url = { protocol: 'bolt', hostname: 'localhost', port: 7687 },
  fixGraphData = true,
} = {}) {
  let concreteDatabaseBehavior = new Database.clientInterface({
    implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter',
  })
  let concereteDatabase = concreteDatabaseBehavior[Database.$.key.getter]()

  const targetProjectRootPath = api.project.configuration.configuration.directory.root
  const exportPath = path.normalize(path.join(targetProjectRootPath, targetPath))

  // convert key to identity of node
  let subgraphEntryNodeIdentityList = new Set()
  for (let key of subgraphEntryNodeKeyList) subgraphEntryNodeIdentityList.add((await concereteDatabase.getNodeByKey({ key })).identity)

  let exportNodeList = new Set(),
    exportEdgeList = new Set()

  // get the connections between the nodes
  let hashTraversedNode = new Set()
  async function addRelatedNode(nodeArray) {
    for (let identity of nodeArray) {
      if (!hashTraversedNode.has(identity)) {
        hashTraversedNode.add(identity)

        let connectionArray = await concereteDatabase.getNodeConnection({ nodeID: identity })
        exportEdgeList = new Set([...exportEdgeList, ...connectionArray.map(result => result.connection.identity) /** get the connections only without the destination and source nodes */])

        let nextNodeArray = new Set(
          [...connectionArray.map(result => result.destination.identity), ...connectionArray.map(result => result.source.identity)].filter(identity => !nodeArray.has(identity)),
        )

        await addRelatedNode(nextNodeArray)
      }
      exportNodeList.add(identity)
    }
  }

  await addRelatedNode(subgraphEntryNodeIdentityList)

  let exportNode = (await concereteDatabase.getAllNode()).filter(node => exportNodeList.has(node.identity)),
    exportEdge = (await concereteDatabase.getAllEdge()).filter(edge => exportEdgeList.has(edge.identity))

  let graphData = { node: exportNode, edge: exportEdge } |> JSON.stringify
  await filesystem.writeFile(path.join(exportPath, fileName), graphData, { encoding: 'utf8', flag: 'w' /*tructace file if exists and create a new one*/ })
  console.log(`• Created json file - ${path.join(exportPath, fileName)}`)

  if (fixGraphData) await fixJSONData({ api, targetPath, exportedFileName: fileName, targetFileName: fileName, url }) // For nodes laking keys, generate random keys.
  concereteDatabase.driverInstance.close()
}

export async function exportSpecificGraphData({ api, targetPath = './test/asset/', fileName = 'specific.exported.json', url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } } = {}) {
  let concreteDatabaseBehavior = new Database.clientInterface({
    implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter',
  })
  let concereteDatabase = concreteDatabaseBehavior[Database.$.key.getter]()

  const targetProjectRootPath = api.project.configuration.configuration.directory.root
  const exportPath = path.normalize(path.join(targetProjectRootPath, targetPath))

  // provide list of node keys to export (nodes will be exported with their connections related to the specific nodes only)
  let nodeKeyArray = [
    // list of node keys to export.
  ]
  let nodeArray = [],
    edgeArray = []

  // get nodes
  for (let key of nodeKeyArray) nodeArray.push(await concereteDatabase.getNodeByKey({ key }))

  // get the connections between the nodes
  for (let node of nodeArray) {
    let queryResultArray = await concereteDatabase.getNodeConnection({ nodeID: node.identity })
    queryResultArray = queryResultArray.map(result => result.connection) // get the connections only without the destination and source nodes
    edgeArray = [...edgeArray, ...queryResultArray]
  }

  // filter edges of the specific nodes only
  edgeArray = edgeArray.filter(edge => nodeArray.some(node => node.identity == edge.start) && nodeArray.some(node => node.identity == edge.end))
  // filter duplicates
  edgeArray = removeArrayDuplicateObjectByIdentity(edgeArray)

  let graphData = { node: nodeArray, edge: edgeArray } |> JSON.stringify
  await filesystem.writeFile(path.join(exportPath, fileName), graphData, { encoding: 'utf8', flag: 'w' /*tructace file if exists and create a new one*/ })
  console.log(`• Created json file - ${path.join(exportPath, fileName)}`)
  concereteDatabase.driverInstance.close()
}

/** This function rewrites the json file - any modifications should be added in the function.
 * `yarn run scriptManager shouldCompileScript=true graphDatabase/exportGraphData ".fixJSONData({ })"`
 */
export async function fixJSONData({ api, targetPath = './resource/', exportedFileName = 'fixed.exported.json', targetFileName = 'taskSequence.graphData.json' } = {}) {
  const targetProjectRootPath = api.project.configuration.configuration.directory.root
  let graphData = require(path.join(targetProjectRootPath, targetPath, targetFileName))

  // modify data
  graphData.node = graphData.node.map(item => {
    // add key to nodes without key
    if (!item.properties.key) {
      console.log(`• Fixing node without key - ` + JSON.stringify(item))
      item.properties.key = uuidv4()
    }
    return item
  })
  graphData.edge = graphData.edge.map(item => {
    // add key to connections without key
    if (!item.properties.key) {
      console.log(`• Fixing edge without key - ` + JSON.stringify(item))
      item.properties.key = uuidv4()
    }
    return item
  })

  const exportPath = path.normalize(path.join(targetProjectRootPath, targetPath, exportedFileName))
  await filesystem.writeFile(exportPath, graphData |> JSON.stringify, { encoding: 'utf8', flag: 'w' /*tructace file if exists and create a new one*/ })
  console.log(`• Created json file - ${exportPath}`)
}

export async function clearDatabase({ concereteDatabase, url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } }) {
  if (!concereteDatabase) {
    let concreteDatabaseBehavior = new Database.clientInterface({
      implementationList: { boltCypherModelAdapter: implementation.database.boltCypherModelAdapterFunction({ url, schemeReference }) },
      defaultImplementation: 'boltCypherModelAdapter',
    })
    concereteDatabase = concreteDatabaseBehavior[Database.$.key.getter]()
  }

  // Delete all nodes in the in-memory database
  const graphDBDriver = concereteDatabase.driverInstance
  let session = await graphDBDriver.session()
  await session.run(`match (n) detach delete n`)
  console.log('• Database data cleared.')
  session.close()
}
