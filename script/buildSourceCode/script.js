import filesystem from 'fs'
import path from 'path'
import { default as git, Commit, Repository, Reference, Branch, Signature, Reset} from 'nodegit'

/**
 * TODO: 
 * • implement a build script for packages where: 
 *      ○ Configuration file for build process.
 *      ○ Build the files inside project for npm packages.
 *      ○ Push new version to github tags. 
 *      ○ Create a new release from the pushed tag.
 * 
 * One release for distribution and another for source code ? 
 */

// const { build } = require('@dependency/buildTool') // build tool has errors

function  adapter(...args) {
    const {
        api, /* supplied by scriptManager */ 
    } = args[0]
    args[0].targetProject = api.project // adapter for working with target function interface.
    build(...args)
}

/**
 * Release a new tag in Github: 
 *  1. Create a temporary branch or use an existing branch and checkout to it. 
 *  2. Rebase onto master (in case the temporary branch exists) - similar to overriding branch history with the master branch.
 *  3. Build code and commit with a distribution message.
 *  4. Create a release/tag.
 *  5. cleanup branches.
 *  6. git checkout master
 * 
 *  @sieEffect - creates a tag and deletes temporary branch.
 * 
 * Simple example equivalent shell script:
 * ```git checkout distribution && git rebase --onto master distribution && echo "Test Page" > new.js && git add -A && git commit -a -m 'build' && git tag v5; git checkout master```
 * 
 * `nodegit` documentation: https://www.nodegit.org/api 
 */
async function createGithubBranchedRelease({ // 'branched release' in the sense of a tag that points to an additional build commit other than the master commit for example.
    api, 
    temporaryBranchName = 'distribution', // branch used to build source code and create a distribution tag from
    brachToPointTo = 'master', // default branch for latest commit.
    commitToPointTo = null, // unrelated commit to point to
    tagName
}) {
    const   targetProject = api.project,
            targetProjectRoot = targetProject.configuration.rootPath,
            targetProjectGitUrl = 'https://github.com/AppScriptIO/scriptManager'

    const repository = await git.Repository.open(targetProjectRoot),
          tagger = git.Signature.now('meow', 'test@example.com')
    brachToPointTo = await git.Branch.lookup(repository, brachToPointTo, 1) // convert to branch reference
    // set commit reference
    commitToPointTo = Boolean(commitToPointTo) ? await git.Commit.lookup(repository, commitToPointTo) // get commit from supplied commit id parameter
                      : await repository.getReferenceCommit(brachToPointTo) // get latest commit from branch
    // get all branches remote and local
    let branchReferenceList = await repository.getReferences(git.Reference.TYPE.OID) 
    
    // check if `temporaryBranchName` branch, that is used, exists.
    let doesTemporaryBranchExist = branchReferenceList.some(branch => branch.toString().includes(temporaryBranchName))
    let temporaryBranch; // Branch reference
    if(!doesTemporaryBranchExist) { // create branch 
        temporaryBranch = await git.Branch.create(repository, temporaryBranchName, commitToPointTo, 1)
            .catch(error => console.error(error))
        console.log(`• Created   temporary branch ${await temporaryBranch.name()} from commit ${commitToPointTo.sha()}`)
    } else {
        temporaryBranch = await git.Branch.lookup(repository, temporaryBranchName, 1)
    }
    // checkout temporary
    await repository.checkoutBranch(await temporaryBranch.name())

    /** reset temporary branch to the commit to point to (targetCommit)
     * Another option is to use rebasing where current commits are saved // rebasingExample()
     */
    await git.Reset.reset(repository, commitToPointTo, git.Reset.TYPE.HARD)
        .then(number => {
            if(number) throw new Error(`• Could not reset repository ${repository} to commit ${commitToPointTo}`)
        }).catch(error => console.error)    

    // run build
    await buildExample({ targetProjectRoot })

    // Create commit of all files.
    let index = await repository.refreshIndex() // invalidates and grabs new index from repository.
    let treeObject = await index.addAll(['**']).then(()=> index.write()).then(() => index.writeTree()) // add files and create a tree object.
    let parentCommit = await repository.getHeadCommit() // get latest commit 
    await repository.createCommit(
            'HEAD' /* update the HEAD reference - so that the HEAD will point to the latest git */ || null /* do not update ref */ , 
            tagger, tagger, 
            `🏗️ Build distribution code.`, 
            treeObject, 
            [parentCommit]
        ).then((oid) => {
            console.log(`• Commit created ${oid} for distribution code`)
        })

    // tag and create a release.
    // let latestTemporaryBranchCommit = await repository.getHeadCommit() // get latest commit 
    // await git.Tag.create(repository, tagName, latestTemporaryBranchCommit, tagger, `Release of distribution code only.`, 0)
    //     .then((oid) => console.log(`• Tag created ${oid}`))


    await repository.checkoutBranch(brachToPointTo) // make sure the branch is checkedout.
    // delete temporary branch
    if(git.Branch.isCheckedOut(temporaryBranch)) throw new Error(`Cannot delete a checked out branch ${await temporaryBranch.name()}.`)
    try {
        temporaryBranch = await git.Branch.lookup(repository, temporaryBranchName, 1) // referesh value of temporaryBranch - for some reason using the same reference prevents deletion of branch.
        let error = git.Branch.delete(temporaryBranch)
        if(error) throw new Error(error)
        console.log(`• Deleted tempoarary branch ${await temporaryBranch.name()}.`)
    } catch (error) { throw error }
    
}

async function buildExample({ targetProjectRoot }) {
    console.log(targetProjectRoot)
    filesystem.writeFile(path.join(targetProjectRoot, 'build.js'), 'content', (err) => {
        if (err) throw err;
        console.log("Project built successfully !")
    })
    
}

// rebase into master branch to follow the latest master commit. TODO: this is an example - fix async operation.
function rebasingExample({repository, branch, fromBranch, toBranch}) {
    return repository.rebaseBranches(
        branch.name(), // branch commits to move
        fromBranch.name(), // till commits that are intersected with this branch (old branch)
        toBranch.name(), // onto the new branch.
        git.Signature.now('meow', 'test@example.com'),
        rebase => {
            console.log("One operation");
            return Promise.resolve();
        },
        rebaseMetadata => {
            console.log("Finished rebase");
            return Promise.resolve();
        }
    )

}

export { adapter as build, createGithubBranchedRelease }