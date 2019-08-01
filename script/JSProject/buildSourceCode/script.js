import filesystem from 'fs'
import path from 'path'
import { build } from '@dependency/buildTool'

// build process for webapps relying on appscript module.
export function webappProject(...args) {
  // adapter for working with target function interface of `scriptManager`.
  const { api /* supplied by scriptManager */ } = args[0]
  args[0].targetProject = api.project
  args[0].entryNodeKey ||= '58c15cc8-6f40-4d0b-815a-0b8594aeb972' // graph tasks traversal entrypoint
  args[0].taskContextName = 'webappProjectTask'
  build(...args).catch(console.error)
}

// build process for Javascript module repositories
export function moduleProject(...args) {
  // adapter for working with target function interface of `scriptManager`.
  const { api /* supplied by scriptManager */ } = args[0]
  args[0].targetProject = api.project
  args[0].entryNodeKey ||= '171d18f8-9d25-4483-aeb9-a29c9fbed6ac' // graph tasks traversal entrypoint
  args[0].taskContextName = 'moduleProjectTask'
  build(...args).catch(console.error)
}
