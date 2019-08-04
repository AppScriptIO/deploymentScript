import { createGithubBranchedRelease } from './release'
import { moduleProject as buildModuleProject, webappProject as buildWebappProject } from './buildSourceCode'

export async function moduleProject({ api, tagName }) {
  await createGithubBranchedRelease({
    api,
    tagName,
    buildCallback: () => buildModuleProject({ api }),
  })
}

export async function webappProject({ api, tagName }) {
  await createGithubBranchedRelease({
    api,
    tagName,
    buildCallback: () => buildWebappProject({ api }),
  })
}
