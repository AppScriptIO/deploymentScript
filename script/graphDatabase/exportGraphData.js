// produce json graph data from database queries

import path from 'path'
import { promises as filesystem } from 'fs'
import { Entity } from '@dependency/entity'
import { Database as DatabaseModule } from '@dependency/graph'
const { Database } = DatabaseModule
import { boltCypherModelAdapterFunction } from '@dependency/graph/source/implementationPlugin/databaseModelAdapter/boltCypherModelAdapter.js'
import assert from 'assert'

let concreteDatabaseBehavior = new Database.clientInterface({
  implementationList: { boltCypherModelAdapter: boltCypherModelAdapterFunction() },
  defaultImplementation: 'boltCypherModelAdapter',
})
let concereteDatabaseInstance = concreteDatabaseBehavior[Entity.reference.getInstanceOf](Database)
let concereteDatabase = concereteDatabaseInstance[Database.reference.key.getter]()

export async function loadGraphDataFromFile({ api /**scriptManager api*/, shouldClearDatabase = false, graphDataFilePath } = {}) {
  assert(graphDataFilePath, `• graphDataFilePath must be passed to script - ${graphDataFilePath}`)
  const targetProjectRootPath = api.project.configuration.configuration.directory.root
  if (shouldClearDatabase) await clearDatabase()
  let absolutePath = path.isAbsolute(graphDataFilePath) ? graphDataFilePath : path.join(targetProjectRootPath, graphDataFilePath)
  let graphData = require(absolutePath)
  assert(Array.isArray(graphData.node) && Array.isArray(graphData.edge), `• Unsupported graph data strcuture- ${graphData.edge} - ${graphData.node}`)
  await concereteDatabase.loadGraphData({ nodeEntryData: graphData.node, connectionEntryData: graphData.edge })
  concereteDatabase.driverInstance.close()
}

// Relies on the interface for concrete database plugins of graphTraversal module.
export async function exportGraphData({ api, targetPath = './test/asset/', fileName = 'graphData.exported.json' } = {}) {
  const targetProjectRootPath = api.project.configuration.configuration.directory.root
  const exportPath = path.normalize(path.join(targetProjectRootPath, targetPath))
  let graphData = { node: await concereteDatabase.getAllNode(), edge: await concereteDatabase.getAllEdge() } |> JSON.stringify
  await filesystem.writeFile(path.join(exportPath, fileName), graphData, { encoding: 'utf8', flag: 'w' /*tructace file if exists and create a new one*/ })
  console.log(`• Created json file - ${path.join(exportPath, fileName)}`)
  concereteDatabase.driverInstance.close()
}

async function clearDatabase() {
  // Delete all nodes in the in-memory database
  const graphDBDriver = concereteDatabase.driverInstance
  let session = await graphDBDriver.session()
  await session.run(`match (n) detach delete n`)
  session.close()
}
