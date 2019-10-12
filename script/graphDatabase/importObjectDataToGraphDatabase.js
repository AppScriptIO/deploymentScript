#!/usr/bin/env node
// This was used as a temporary file used to transfering object data to graph structure in the database.

const neo4jGraphDatabase = require('neo4j-driver').v1
let neo4jGraphDBDriver = neo4jGraphDatabase.driver('bolt://localhost', neo4jGraphDatabase.auth.basic('neo4j', 'test'))
const classification = ''
let nodeArray = []

;(async () => {
  let session = await neo4jGraphDBDriver.session()

  // for (let node of nodeArray) {
  //   let query = `key: '${node.key}', name: '${node.label.name}', classification: '${classification}' `
  //   if (node.callback) query += `, callback: ${JSON.stringify(JSON.stringify(node.callback))}`
  //   let result = await session.run(`
  //     match (p:Process { key: '${node.dataItemKey}', classification: '${classification}' })
  //     create (s:Stage { ${query} }), (s)-[:EXECUTE]->(p)
  //     RETURN p
  //   `)

  //   if (node.port)
  //     for (let port of node.port) {
  //       let result = await session.run(`
  //         MATCH (stage:Stage { key: '${node.key}', classification: '${classification}' })
  //         CREATE (port:Port { key: '${port.key}', traverseNodeImplementation: '${port.executionType}' }),
  //         (stage)-[:HAS_PORT { order: ${port.order}}]->(port)
  //         RETURN port
  //       `)
  //       {
  //         for (let record of result.records) {
  //           let createdNode = record.toObject()
  //           console.log(createdNode.port)
  //         }
  //       }
  //     }

  //   for (let record of result.records) {
  //     let createdNode = record.toObject()
  //     process.stdout.write(`${node.key} --> ${createdNode.p.properties.key}\n`)
  //     // console.log(createdNode.p.properties.processDataImplementation)
  //   }
  // }

  //--------------------------------------------------------------------------------------------------

  // // TODO: don't forget the additional node graph
  // for (let node of nodeArray) {
  //   if (node.connection) {
  //     // node.children = node.children.filter(v => v.insertionPosition.insertionPathPointer)
  //     for (let index in node.connection) {
  //       let child = node.connection[index]
  //       // console.log(child)
  //       let result = await session.run(`
  //       match (s:Stage { key: '${node.key}', classification: '${classification}' })-[:HAS_PORT]->(port:Port) where port.key = '${child.insertionPosition.port}'
  //       match (snext:Stage { key: '${child.nestedUnit}', classification: '${classification}' })
  //       create (port)-[:NEXT { order: ${index || 1}}]->(snext)
  //       RETURN port, snext
  //     `)

  //       for (let record of result.records) {
  //         let createdNode = record.toObject()
  //         process.stdout.write(`${createdNode.port.properties.key} --> ${createdNode.snext.properties.key}\n`)
  //       }
  //     }
  //   }
  // }

  session.close()
  neo4jGraphDBDriver.close()
})()

async function createConnection() {
  for (let node of nodeArray) {
    if (node.children)
      for (let child of node.children) {
        let result = await session.run(`
          MATCH (snext:Stage { key: '${child.nestedUnit}'})
          MATCH (s:Stage {key:'${node.key}'})-[:HAS_PORT]->(p:Port { key: '${child.insertionPosition.insertionPoint}'})
          CREATE (p)-[l:NEXT { order: ${child.insertionPosition.order} }]->(snext)
          RETURN l
        `)
        console.log(result)
      }
  }
}

async function createStageAndPort() {
  for (let node of nodeArray) {
    let result = await session.run(`
      match (p:Process) where p.key = '${node.unitKey}'
      create (s:Stage { key: '${node.key}', name: '${node.label.name}' })-[:EXECUTE]->(p)
      return s
    `)
    for (let record of result.records) {
      let createdNode = record.toObject().s
      if (node.insertionPoint)
        for (let port of node.insertionPoint) {
          let result = await session.run(`
            MATCH (stage:Stage { key: '${node.key}' })
            CREATE (port:Port { key: '${port.key}', traverseNodeImplementation: '${port.executionType}' }), 
            (stage)-[:HAS_PORT { order: ${port.order}}]->(port)
            RETURN port
          `)
          console.log(result.port)
        }
    }
  }
}

async function createFileResource() {
  for (let node of nodeArray) {
    let result = await session.run(`
      create (n:FileResource { key: '${node.key}', name: '${node.label.name}', algorithm: ${JSON.stringify(JSON.stringify(node.algorithm))} })
      return n
    `)
    for (let record of result.records) {
      let createdNode = record.toObject()
      console.log(createdNode)
    }
  }
}

async function createProcess() {
  for (let node of nodeArray) {
    let query = `key: '${node.key}', name: '${node.name}'`
    if (node.fieldName) query += `, fieldName: '${node.fieldName}'`
    if (node.args) query += `, args: ${JSON.stringify(JSON.stringify(node.args))}`
    let result = await session.run(`
      match (r:FileResource) where r.key = '${node.fileKey}'
      create (p:Process { ${query} }), (p)-[:RESOURCE]->(r)
      return p
    `)
    for (let record of result.records) {
      let createdNode = record.toObject()
      console.log(createdNode)
    }
  }
}
