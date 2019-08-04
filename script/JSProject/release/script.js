import filesystem from 'fs'
import path from 'path'
import childProcess from 'child_process'
import filesystemExtra from 'fs-extra'
import { default as git, Commit, Repository, Reference, Branch, Signature, Reset, Stash } from 'nodegit'
import { copyFile } from '../../../source/utility/filesystemOperation/copyFile.js'
const getDirectory = source => filesystem.readdirSync(source, { withFileTypes: true }).filter(dirent => dirent.isDirectory())
const getAllDirent = source => filesystem.readdirSync(source, { withFileTypes: true })
/** Filter array with async function
 * https://stackoverflow.com/questions/33355528/filtering-an-array-with-a-function-that-returns-a-promise
 */
async function filterAsync(arr, callback) {
  const fail = Symbol()
  return (await Promise.all(arr.map(async item => ((await callback(item)) ? item : fail)))).filter(i => i !== fail)
}

//? TODO: Releases could be created for source code and for distribution code

/**
 * ○ Push new version to github tags.
 * ○ Create a new release from the pushed tag.
 * Release a new tag in Github:
 *  0. stash changes temporarily
 *  1. Create a temporary branch or use an existing branch and checkout to it.
 *  2. Rebase or Reseting onto master (in case the temporary branch exists) - similar to overriding branch history with the master branch.
 *  3. Build code and commit with a distribution message.
 *  4. Create a release/tag.
 *  5. cleanup branches.
 *  6. git checkout master
 *  7. pop last stash files
 *
 *  @sieEffect - creates a tag and deletes temporary branch.
 *
 * Simple example equivalent shell script:
 * ```git checkout distribution && git rebase --onto master distribution && echo "Test Page" > new.js && git add -A && git commit -a -m 'build' && git tag v5; git checkout master```
 *
 * `nodegit` documentation: https://www.nodegit.org/api
 */
export async function createGithubBranchedRelease({
  // 'branched release' in the sense of a tag that points to an additional build commit other than the master commit for example.
  api,
  temporaryBranchName = 'distribution', // branch used to build source code and create a distribution tag from
  brachToPointTo = 'master', // default branch for latest commit.
  commitToPointTo = null, // unrelated commit to point to while creating temporary branch
  tagName,
  tagger = git.Signature.now('meow', 'test@example.com'),
  buildCallback, // build async function that will handle building source code and preparing the package for distribution.
}) {
  const targetProject = api.project,
    targetProjectConfig = targetProject.configuration.configuration,
    targetProjectRoot = targetProject.configuration.rootPath,
    targetProjectGitUrl = targetProject.configuration.configuration?.build.repositoryURL

  // read git repository
  const repository = await git.Repository.open(targetProjectRoot)
  brachToPointTo = await git.Branch.lookup(repository, brachToPointTo, 1) // convert to branch reference
  // get latest commit from branch
  let getLatestCommit = await repository.getReferenceCommit(brachToPointTo)
  // set commit reference
  if (commitToPointTo) {
    commitToPointTo = await git.Commit.lookup(repository, commitToPointTo) // get commit from supplied commit id parameter
  } else commitToPointTo = getLatestCommit

  // get all branches remote and local
  let branchReferenceList = await repository.getReferences().then(referenceList => referenceList.filter(reference => reference.type() == git.Reference.TYPE.DIRECT))

  // check if `temporaryBranchName` branch, that is used, exists.
  let doesTemporaryBranchExist = branchReferenceList.some(branch => branch.toString().includes(temporaryBranchName))
  let temporaryBranch // Branch reference
  if (!doesTemporaryBranchExist) {
    // create temporary branch
    temporaryBranch = await git.Branch.create(repository, temporaryBranchName, commitToPointTo, 1).catch(error => console.error(error))
    console.log(`• Created temporary branch ${await temporaryBranch.name()} from commit ${commitToPointTo.sha()}`)
  } else temporaryBranch = await git.Branch.lookup(repository, temporaryBranchName, 1)

  // check if there are untracked or staged files
  let statuseList = await repository.getStatus()
  if (statuseList.length > 0)
    // stash changes that are still not committed
    await git.Stash.save(repository, tagger, 'checkout stash before release', git.Stash.FLAGS.INCLUDE_UNTRACKED)

  // checkout temporary
  await repository.checkoutBranch(await temporaryBranch.name()).then(async () => console.log(`Checked branch ${await temporaryBranch.name()}`))

  /** reset temporary branch to the commit to point to (targetCommit)
   * NOTE: Another option is to use rebasing where current commits are saved - check  `rebasingExample()` function
   */
  await git.Reset.reset(repository, commitToPointTo, git.Reset.TYPE.HARD)
    .then(number => {
      if (number) throw new Error(`• Could not reset repository ${repository} to commit ${commitToPointTo}`)
    })
    .catch(error => console.error)

  // run build
  if (buildCallback) await buildCallback().then(() => console.log('Project built successfully !'))

  /** Make distribution folder as root directory in the branch */
  // deleting .gitignore will make it faster, by preventing node_modules from being processed by tools while deleting files.
  let gitExcludePath = path.join(targetProjectRoot, './.git/info/exclude'),
    gitIgnorePath = path.join(targetProjectRoot, './.gitignore')
  if (filesystem.existsSync(gitExcludePath)) filesystem.unlinkSync(gitExcludePath) // remove file
  copyFile([{ source: gitIgnorePath, destination: gitExcludePath }]) // copy .gitignore to `.git` folder

  // get top directories that are ignored
  let direntList = getAllDirent(targetProjectRoot) // get all files and directories on top level
  // check if path is ignored
  let ignoredDirectoryList = await filterAsync(direntList, async dirent => (await git.Ignore.pathIsIgnored(repository, path.join(targetProjectRoot, dirent.name))) |> Boolean)
  // ignoredDirectoryList = ignoredDirectoryList.map(dirent => path.join(targetProjectRoot, dirent.name)) // get absolute paths
  // get dirent list to delete
  let direntToDelete = direntList.filter(dirent => !ignoredDirectoryList.includes(dirent)) // remove ignored dirents from delete list
  /** Delete dirent list that includes directories and files */
  let deleteAbsolutePathList = direntToDelete.map(dirent => path.join(targetProjectRoot, dirent.name))
  for (let absolutePath of deleteAbsolutePathList) {
    filesystemExtra.removeSync(absolutePath)
  }
  // copy distribution contents to root project level
  filesystemExtra.copySync(targetProjectConfig.directory.distribution, targetProjectRoot)

  // Create commit of all files.
  let index = await repository.refreshIndex() // invalidates and grabs new index from repository.
  let treeObject = await index
    .addAll(['**'])
    .then(() => index.write())
    .then(() => index.writeTree()) // add files and create a tree object.
  let parentCommit = await repository.getHeadCommit() // get latest commit
  await repository
    .createCommit('HEAD' /* update the HEAD reference - so that the HEAD will point to the latest git */ || null /* do not update ref */, tagger, tagger, `🏗️ Build distribution code.`, treeObject, [
      parentCommit,
    ])
    .then(oid => {
      console.log(`• Commit created ${oid} for distribution code`)
    })

  // tag and create a release.
  let latestTemporaryBranchCommit = await repository.getHeadCommit() // get latest commit
  await git.Tag.create(repository, tagName, latestTemporaryBranchCommit, tagger, `Release of distribution code only.`, 0).then(oid => console.log(`• Tag created ${oid}`))

  // make sure the branch is checkedout.
  await repository.checkoutBranch(brachToPointTo).then(async () => console.log(`Checked branch ${await brachToPointTo.name()}`)) // checkout former branch (usually master branch)

  // apply temporarly stashed files
  if (statuseList.length > 0) await git.Stash.pop(repository, 0 /** last stached position */)
}

/** rebase into master branch to follow the latest master commit. TODO: this is an example - fix async operation.
 *  This is an option for rebasing a temporary branch to the latest commit (or a newer commit). Another option is to use `reset` to a different commit.
 */
function rebasingExample({ repository, branch, fromBranch, toBranch }) {
  return repository.rebaseBranches(
    branch.name(), // branch commits to move
    fromBranch.name(), // till commits that are intersected with this branch (old branch)
    toBranch.name(), // onto the new branch.
    git.Signature.now('meow', 'test@example.com'),
    rebase => {
      console.log('One operation')
      return Promise.resolve()
    },
    rebaseMetadata => {
      console.log('Finished rebase')
      return Promise.resolve()
    },
  )
}

async function deleteTemporaryBranch({ repository, temporaryBranch }) {
  // delete temporary branch
  try {
    if (git.Branch.isCheckedOut(temporaryBranch)) throw new Error(`Cannot delete a checked out branch ${await temporaryBranch.name()}.`)
    // By reassigning the variable and looking up the branch the garbage collector will kick in. The reference for the branch in libgit2 shouldn't be in memory as mentioned in https://github.com/libgit2/libgit2/blob/859d92292e008a4d04d68fb6dc20a1dfa68e4874/include/git2/refs.h#L385-L398
    temporaryBranch = await git.Branch.lookup(repository, temporaryBranchName, 1) // referesh value of temporaryBranch - for some reason using the same reference prevents deletion of branch.
    let error = git.Branch.delete(temporaryBranch)
    if (error) throw new Error(`Code thrown by 'libgit2' bindings = ${error}\n \tCheck https://www.nodegit.org/api/error/#CODE`)
    console.log(`• Deleted tempoarary branch ${await temporaryBranch.name()}.`)
  } catch (error) {
    throw error
  }
}
