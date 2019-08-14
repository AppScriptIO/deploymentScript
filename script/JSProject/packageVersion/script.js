import path from 'path'
import util from 'util'
import assert from 'assert'
import os from 'os'
import filesystem from 'fs'
import modifyJson from 'jsonfile'
import gitUrlParser from 'git-url-parse'
import semanticVersioner from 'semver'
import { pickBy, remove as removeMutateArray } from 'lodash'
import { getReleases, githubGraphqlEndpoint } from './graphqlQuery/github.graphql.js'
import { createGraphqlClient } from './utility/createGraphqlClient.js'
import writeJsonFile from 'write-json-file'
import nestedObjectAssign from 'nested-object-assign'
const dependencyKeyword = ['dependencies', 'devDependencies', 'peerDependencies'] // package.json dependencies key values
import { default as git, Commit, Repository, Reference, Branch, Signature, Reset, Stash } from 'nodegit'

/** increase package.json version to prepare for new release */
export async function bumpVersion({
  api,
  token, // github token for Graphql API
  tagger,
}: {
  tagger: { name: '', email: '' },
}) {
  token ||= process.env.GITHUB_TOKEN || lookupGithubToken({ sshPath: '/e/.ssh' })
  assert(token, `❌ Github access token must be supplied.`)

  const targetProjectConfig = api.project.configuration.configuration,
    targetProjectRoot = targetProjectConfig.directory.root,
    targetPackagePath = path.join(targetProjectRoot, 'package.json')

  // commit changes
  const repository = await git.Repository.open(targetProjectRoot)

  // load taggerSignature signature
  let taggerSignature = tagger ? git.Signature.now(tagger.name, tagger.email) : await git.Signature.default(repository)
  assert(taggerSignature, `❌ Github username should be passed or found in the git local/system configs.`)

  // read package.json file
  let packageConfig = await modifyJson.readFile(targetPackagePath).catch(error => console.error(error))

  // bump version
  let updatedVersion = semanticVersioner.inc(packageConfig.version, 'patch') // increment version by release type - release type (major, premajor, minor, preminor, patch, prepatch, or prerelease).

  // update pacakge.json
  console.log(`• Updating pacakge.json file ${targetPackagePath} with bumped version ${packageConfig.version} --> ${updatedVersion}`)
  packageConfig.version = updatedVersion
  await writeJsonFile(targetPackagePath, packageConfig)

  // Create commit of all files.
  let index = await repository.refreshIndex() // invalidates and grabs new index from repository.
  let treeObject = await index
    .addAll(['**'])
    .then(() => index.write())
    .then(() => index.writeTree()) // add files and create a tree object.
  let parentCommit = await repository.getHeadCommit() // get latest commit
  await repository
    .createCommit(
      'HEAD' /* update the HEAD reference - so that the HEAD will point to the latest git */ || null /* do not update ref */,
      taggerSignature,
      taggerSignature,
      `📦 Bump package.json version.`,
      treeObject,
      [parentCommit],
    )
    .then(oid => console.log(`• Commit created ${oid} for package.json version bump`))

  return updatedVersion
}

// adapter to the scriptManager api.
function adapter(...args) {
  const { api /* supplied by scriptManager */ } = args[0]
  args[0].targetProject = api.project // adapter for working with target function interface.
  updateGithubPackage(...args).catch(error => console.error(error))
}
export { adapter as checkVersion }
/**
 * Update github dependencies in package.json files, using the github api that checks for the latest github release and compares it to local semver version.
 */
async function updateGithubPackage({
  targetProject, // target project's configuration instance.
  token, // github token for Graphql API
  prereleaseType = false, // example prereleaseType='distribution' matches all x.x.x-<...>distribution<...>
  shouldUpdatePackage = false,
} = {}) {
  if (!token) token = process.env.GITHUB_TOKEN || lookupGithubToken()
  assert(token, `❌ Github access token must be supplied.`)

  const targetProjectRoot = targetProject.configuration.rootPath,
    targetPackagePath = path.join(targetProjectRoot, 'package.json')

  const graphqlClient = createGraphqlClient({ token, endpoint: githubGraphqlEndpoint })

  // read package.json file
  let packageConfig = await modifyJson.readFile(targetPackagePath).catch(error => console.error(error))

  let didAnyRepoUpdate = false

  // loop dependencies
  let modifiedPackageObject = {}
  for (let keyName of dependencyKeyword) {
    if (!packageConfig[keyName]) continue
    let dependencyList = packageConfig[keyName]

    // filter dependencies that are from github only
    let githubDependency = filterGithubDependency({ dependencyList })
    for (let [index, repositoryUrl] of Object.entries(githubDependency)) {
      const parsedUrl = gitUrlParser(repositoryUrl),
        currentUrlVersion = parsedUrl.hash && parsedUrl.hash.replace('semver:', '') // Specific use case - remove "semver:" from hash. This is used to support github semver versions in npm.
      if (!currentUrlVersion) continue // skip urls without specific version
      if (!semanticVersioner.valid(currentUrlVersion) && semanticVersioner.validRange(currentUrlVersion)) {
        console.log(`Skipping "${repositoryUrl}" with range semver ${currentUrlVersion} `)
        continue
      } // skip ranges

      let releaseList = await queryReleaseUsingUrl({ graphqlClient, repositoryUrl })
      if (!releaseList.length) continue // skip
      // filter comperable & semver versioned tags only
      filterComparableRelease({ releaseList: { reference: releaseList } })
      // filter tags with prerelease (include or exclude)
      if (prereleaseType) {
        // keep only tags that include a specific prerelease type.
        removeMutateArray(releaseList, value => {
          let prereleaseComponent = semanticVersioner.prerelease(value.tag.name)
          return prereleaseComponent && prereleaseComponent.includes(prereleaseType) ? false : true
        })
      } else {
        // filter versions that includes prerelease type (x.x.x-<prereleaseTyp>)
        removeMutateArray(releaseList, value => Boolean(semanticVersioner.prerelease(value.tag.name)))
      }

      let latestRelease = pickLatestRelease({ releaseList })

      // compare semver versions
      let shouldUpdateVerion = false
      if (currentUrlVersion && latestRelease) {
        console.log(`Comparing package.json version %s with latest release %s:`, currentUrlVersion, latestRelease)
        shouldUpdateVerion = semanticVersioner.gt(latestRelease, currentUrlVersion)
      }

      if (shouldUpdateVerion) {
        didAnyRepoUpdate = true
        githubDependency[index] = updateVersion({ parsedUrl, newVersion: latestRelease })
      } else {
        console.log(`• Git URI ${repositoryUrl} is up to date. Current "%s" - latest "%s":`, currentUrlVersion, latestRelease)
      }
    }

    // create a new list with updated versions
    modifiedPackageObject[keyName] = githubDependency
  }

  if (didAnyRepoUpdate) {
    // update pacakge.json
    let mergedPackageObject = nestedObjectAssign(packageConfig, modifiedPackageObject)
    if (shouldUpdatePackage) {
      await writeJsonFile(targetPackagePath, mergedPackageObject)
      console.log(`• Package.json file was updated with the latest Git packages.`)
    } else {
      console.log(`• Pacakge object with updated versions:`)
      console.dir(mergedPackageObject)
    }
  } else console.log(`• No repository needs update.`)
}

// Read github token from OS user's folder.
function lookupGithubToken({ sshPath = path.join(os.homedir(), '.ssh'), tokenFileName = 'github_token' } = {}) {
  const tokenFile = path.join(sshPath, tokenFileName)
  return filesystem.readFileSync(tokenFile).toString()
}

// pick only github uri dependencies
function filterGithubDependency({ dependencyList }) {
  return pickBy(dependencyList, (value, index) => {
    let parsedUrl = gitUrlParser(value)
    return parsedUrl.resource == 'github.com'
  })
}

// get the releases on github
async function queryReleaseUsingUrl({ graphqlClient, repositoryUrl }) {
  let parsedUrl = gitUrlParser(repositoryUrl),
    currentUrlVersion = parsedUrl.hash

  let releaseArray = await graphqlClient
    .query({
      query: getReleases,
      variables: {
        repoURL: repositoryUrl,
      },
    })
    .then(response => {
      return response.data.resource.releases.edges.map((value, index) => {
        return value.node
      })
    })
    .catch(error => {
      throw error
    })

  return releaseArray
}

function pickLatestRelease({ releaseList }) {
  releaseList.sort((current, next) => {
    return semanticVersioner.gt(current.tag.name, next.tag.name) ? -1 /*Sort on lower index*/ : 1
  })
  return releaseList[0].tag.name // pick greater release
}

// filter array variable passed as reference.
function filterComparableRelease({ releaseList = { reference: [] } }) {
  // filter drafts and pre-releases
  removeMutateArray(releaseList.reference, value => Boolean(value.isPrerelease || value.isDraft))
  // filter non-semver versioned tags
  removeMutateArray(releaseList.reference, value => !Boolean(semanticVersioner.valid(value.tag.name)))
  // filter releases without tags  - draft releases do not have tags, remove any release that doesn't have a tag for any other reason also.
  removeMutateArray(releaseList.reference, value => !Boolean(value.tag))
}

function updateVersion({ parsedUrl, newVersion: latestRelease }) {
  let semverPrefix = parsedUrl.hash.includes('semver:') ? 'semver:' : '' // check if `semver:` for git url was present
  // parsedUrl.hash = latestRelease // Important: gitUrlParser.stringify doesn't take care of hashes for some reason.
  return `${gitUrlParser.stringify(parsedUrl)}#${semverPrefix}${latestRelease}`
}
