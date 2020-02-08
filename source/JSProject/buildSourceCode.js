import filesystem from 'fs'
import path from 'path'
import { build } from '@deployment/buildTool'
import * as container from './container'

// build process for webapps relying on appscript module.
export async function webappProject(
  {
    // adapter for working with target function interface of `scriptManager`.
    api /* supplied by scriptManager */,
    entryNodeKey,
    memgraph,
  },
  ...args
) {
  await container.memgraph.clearGraphData({ memgraph }) // clear database and load graph data:

  await build(
    {
      api,
      targetProject: api.project,
      entryNodeKey: entryNodeKey || '58c15cc8-6f40-4d0b-815a-0b8594aeb972',
      taskContextName: 'webappProjectTask', // graph tasks traversal entrypoint
      memgraph,
    },
    ...args,
  ).catch(console.error)
}

// build process for Javascript module repositories
export async function moduleProject(
  {
    // adapter for working with target function interface of `scriptManager`.
    api /* supplied by scriptManager */,
    entryNodeKey,
    memgraph,
  },
  ...args
) {
  await container.memgraph.clearGraphData({ memgraph }) // clear database and load graph data:

  await build(
    {
      api,
      targetProject: api.project,
      entryNodeKey: entryNodeKey || '171d18f8-9d25-4483-aeb9-a29c9fbed6ac',
      taskContextName: 'moduleProjectTask', // graph tasks traversal entrypoint
      memgraph,
    },
    ...args,
  ).catch(console.error)
}
