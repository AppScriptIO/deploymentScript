import { createGithubBranchedRelease } from './release'
import { moduleProject as buildModuleProject, webappProject as buildWebappProject } from './buildSourceCode'
import { bumpVersion } from './packageVersion'
import { runDockerContainer } from '../graphDatabase/memgraphContainer.js'

export async function moduleProject({ api, tagName }) {
  runDockerContainer() // run memgraph container for usage in buildTool graphTraversal module.
  let version = await bumpVersion({ api })
  await createGithubBranchedRelease({
    api,
    tagName: tagName || version,
    buildCallback: () => buildModuleProject({ api }),
  })
}

export async function webappProject({ api, tagName }) {
  runDockerContainer() // run memgraph container for usage in buildTool graphTraversal module.
  let version = await bumpVersion({ api })
  await createGithubBranchedRelease({
    api,
    tagName: version,
    buildCallback: () => buildWebappProject({ api }),
  })
}
