import path from 'path'
import util from 'util'
import modifyJson from 'jsonfile'
import gitUrlParser from 'git-url-parse'
import { pickBy } from 'lodash'
import { getReleases, githubGraphqlEndpoint } from './graphqlQuery/github.graphql.js'
import { createGraphqlClient } from './utility/createGraphqlClient.js'

// adapter to the scriptManager api.
export function checkVersion(...args) {
    const {
        api, /* supplied by scriptManager */ 
    } = args[0]
    args[0].targetProject = api.project // adapter for working with target function interface.
    checkLatestVersionOnGithub(...args).catch(error => console.error(error))
}

/**
 * TODO: 
 * • Extract URL and any commit or tag value.
 * • Hit github API to check for newer tags or newer releases. 
 * • Bump version - update package.json in case a newer version is found.
 */
async function checkLatestVersionOnGithub({ targetProject, token }) {
    const   targetRootPath = targetProject.configuration.rootPath,
            targetPackagePath = path.join(targetRootPath, 'package.json')

    const graphqlClient = createGraphqlClient({ token, endpoint: githubGraphqlEndpoint })

    // read package.json file 
    let packageConfig = await modifyJson.readFile(targetPackagePath).catch(error => console.error(error))
    
    // loop dependencies
    let dependencyKeyword = ['dependencies', 'devDependencies']
    dependencyKeyword.forEach(async keyName => {
        if(!packageConfig[keyName]) return;
        let dependencyObject = packageConfig[keyName]
        
        // filter dependencies that are from github only
        let githubDependency = pickBy(dependencyObject, (value, index) => {
            let parsedUrl = gitUrlParser(value)
            return parsedUrl.resource == 'github.com'
        })

        for(let [index, repositoryUrl] of Object.entries(githubDependency)) {
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
            
            console.log(releaseArray)
            
        }

    })

}

