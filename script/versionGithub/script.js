import path from 'path'
import util from 'util'
import assert from 'assert'
import os from 'os'
import filesystem from 'fs'
import modifyJson from 'jsonfile'
import gitUrlParser from 'git-url-parse'
import semanticVersioner from 'semver'
import { pickBy } from 'lodash'
import { getReleases, githubGraphqlEndpoint } from './graphqlQuery/github.graphql.js'
import { createGraphqlClient } from './utility/createGraphqlClient.js'
import { skip } from 'rxjs/operators';
const dependencyKeyword = ['dependencies', 'devDependencies', 'peerDependencies'] // package.json dependencies key values

// adapter to the scriptManager api.
function adapter(...args) {
    const {
        api, /* supplied by scriptManager */ 
    } = args[0]
    args[0].targetProject = api.project // adapter for working with target function interface.
    updateGithubPackage(...args).catch(error => console.error(error))
}

/**
 * TODO: 
 * • Extract URL and any commit or tag value.
 * • Hit github API to check for newer tags or newer releases. 
 * • Bump version - update package.json in case a newer version is found.
 */
async function updateGithubPackage({ 
    targetProject, // target project's configuration instance.
    token // github token for Graphql API
} = {}) {
    if(!token) token = process.env.GITHUB_TOKEN || lookupGithubToken()
    assert(token, `❌ Github access token must be supplied.`)

    const   targetRootPath = targetProject.configuration.rootPath,
            targetPackagePath = path.join(targetRootPath, 'package.json')

    const graphqlClient = createGraphqlClient({ token, endpoint: githubGraphqlEndpoint })

    // read package.json file 
    let packageConfig = await modifyJson.readFile(targetPackagePath).catch(error => console.error(error))

    // loop dependencies
    dependencyKeyword.forEach(async keyName => {
        if(!packageConfig[keyName]) return;
        let dependencyList = packageConfig[keyName]
        
        // filter dependencies that are from github only
        let githubDependency = filterGithubDependency({ dependencyList })
        for(let [index, repositoryUrl] of Object.entries(githubDependency)) {
            let releaseList = await getReleaseUsingUrl({ graphqlClient, repositoryUrl })
            if(!releaseList.length) continue; // skip
            // filter drafts and pre-releases
            releaseList.filter((value, index) => !Boolean(value.isPrerelease || value.isDraft))

            console.log(releaseList)
            let latestRelease = releaseList[0].tag.name
            let parsedUrl = gitUrlParser(repositoryUrl),
                parsedVersion = parsedUrl.hash
            
            // compare semver versions
            console.log(`Comparing package.json version %s with latest release %s:`, parsedVersion, latestRelease)
            let shouldUpdateVerion = semanticVersioner.gt(latestRelease, parsedVersion)
            console.log(shouldUpdateVerion)

            // create dependency list with new versions 
            if(shouldUpdateVerion) {

            }
        }
    })

}

// Read github token from OS user's folder.
function lookupGithubToken({ 
    sshPath = path.join(os.homedir(), '.ssh'),
    tokenFileName = 'github_token'
 } ={}) {
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
async function getReleaseUsingUrl({ graphqlClient, repositoryUrl }) {
    let parsedUrl = gitUrlParser(repositoryUrl),
    parsedVersion = parsedUrl.hash

    if(parsedVersion) {
        // console.log(parsedUrl)
    }

    let releaseArray = await graphqlClient.query({ 
            query: getReleases, 
            variables: {
                "repoURL": repositoryUrl
            }
        }).then(response => {
            return response.data.resource.releases.edges.map((value, index) => {
                return value.node
            })
        }).catch(error => { throw error })

    return releaseArray
}

export { adapter as checkVersion }