// produce json graph data from database queries

import path from 'path'
import assert from 'assert'
import { promises as filesystem, existsSync, mkdirSync } from 'fs'
import { Entity } from '@dependency/entity'
import { Database as DatabaseModule, schemeReference } from '@dependency/graphTraversal'
const { Database } = DatabaseModule
import { database } from '@dependency/graphTraversal-implementation'
import { file } from 'babel-types'
const uuidv4 = require('uuid/v4')

// remove duplicate objects from array using the identity property to check equality
function removeArrayDuplicateEdgeObject(array) {
  let unique = []
  array.forEach(item => {
    if (!unique.some(i => i.identity == item.identity)) unique.push(item)
  })
  return unique
}

export async function loadGraphDataFromFile({ api /**scriptManager api*/, shouldClearDatabase = false, graphDataFilePath, url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } } = {}) {
  let concreteDatabaseBehavior = new Database.clientInterface({
    implementationList: { boltCypherModelAdapter: database.boltCypherModelAdapterFunction({ url, schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter',
  })
  let concereteDatabaseInstance = concreteDatabaseBehavior[Entity.reference.getInstanceOf](Database)
  let concereteDatabase = concereteDatabaseInstance[Database.reference.key.getter]()

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
    implementationList: { boltCypherModelAdapter: database.boltCypherModelAdapterFunction({ url, schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter',
  })
  let concereteDatabaseInstance = concreteDatabaseBehavior[Entity.reference.getInstanceOf](Database)
  let concereteDatabase = concereteDatabaseInstance[Database.reference.key.getter]()

  const targetProjectRootPath = api.project.configuration.configuration.directory.root
  const exportPath = path.normalize(path.join(targetProjectRootPath, targetPath))
  let graphData = { node: await concereteDatabase.getAllNode(), edge: await concereteDatabase.getAllEdge() } |> JSON.stringify

  if (!existsSync(exportPath)) mkdirSync(exportPath, { recursive: true }) // create base directory if it doesn't exist
  await filesystem.writeFile(path.join(exportPath, fileName), graphData, { encoding: 'utf8', flag: 'w' /*tructace file if exists and create a new one*/ })
  console.log(`• Created json file - ${path.join(exportPath, fileName)}`)

  if (fixGraphData) await fixJSONData({ api, targetPath, exportedFileNameL: fileName, targetFileName: fileName, url }) // For nodes laking keys, generate random keys.

  concereteDatabase.driverInstance.close()
}

export async function exportSpecificGraphData({ api, targetPath = './test/asset/', fileName = 'specific.exported.json', url = { protocol: 'bolt', hostname: 'localhost', port: 7687 } } = {}) {
  let concreteDatabaseBehavior = new Database.clientInterface({
    implementationList: { boltCypherModelAdapter: database.boltCypherModelAdapterFunction({ url, schemeReference }) },
    defaultImplementation: 'boltCypherModelAdapter',
  })
  let concereteDatabaseInstance = concreteDatabaseBehavior[Entity.reference.getInstanceOf](Database)
  let concereteDatabase = concereteDatabaseInstance[Database.reference.key.getter]()

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
  edgeArray = removeArrayDuplicateEdgeObject(edgeArray)

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
      implementationList: { boltCypherModelAdapter: database.boltCypherModelAdapterFunction({ url, schemeReference }) },
      defaultImplementation: 'boltCypherModelAdapter',
    })
    let concereteDatabaseInstance = concreteDatabaseBehavior[Entity.reference.getInstanceOf](Database)
    concereteDatabase = concereteDatabaseInstance[Database.reference.key.getter]()
  }

  // Delete all nodes in the in-memory database
  const graphDBDriver = concereteDatabase.driverInstance
  let session = await graphDBDriver.session()
  await session.run(`match (n) detach delete n`)
  console.log('• Database data cleared.')
  session.close()
}
