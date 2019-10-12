import { createGithubBranchedRelease } from './release'
import { moduleProject as buildModuleProject, webappProject as buildWebappProject } from './buildSourceCode'
import { bumpVersion } from './packageVersion'

export async function moduleProject({ api, tagName }) {
  let version = await bumpVersion({ api })
  await createGithubBranchedRelease({
    api,
    tagName: version,
    buildCallback: () => buildModuleProject({ api }),
  })
}

export async function webappProject({ api, tagName }) {
  let version = await bumpVersion({ api })
  await createGithubBranchedRelease({
    api,
    tagName: version,
    buildCallback: () => buildWebappProject({ api }),
  })
}
