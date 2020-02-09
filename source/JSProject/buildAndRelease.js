import { createGithubBranchedRelease } from './release'
import { moduleProject as buildModuleProject, webappProject as buildWebappProject } from './buildSourceCode.js'
import { bumpVersion } from './packageVersion'
import * as container from './container'

export async function moduleProject({ api, tagName, shouldBuildCode = true } = {}) {
  container.memgraph.runDockerContainer() // run memgraph container for usage in buildTool graphTraversal module.
  let version = await bumpVersion({ api })
  await createGithubBranchedRelease({
    api,
    tagName: tagName || version,
    buildCallback: shouldBuildCode ? () => buildModuleProject({ api }) : undefined,
  })
}

export async function webappProject({ api, tagName, shouldBuildCode = true } = {}) {
  container.memgraph.runDockerContainer() // run memgraph container for usage in buildTool graphTraversal module.
  let version = await bumpVersion({ api })
  await createGithubBranchedRelease({
    api,
    tagName: version,
    buildCallback: shouldBuildCode ? () => buildWebappProject({ api }) : undefined,
  })
}
