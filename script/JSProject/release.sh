# TODO - remove dev dependencies from package.json.

version=${1:-1.0.0}
echo "\033[1;32m Releasing version: $version \033[0m"

### Newer way that will keep branch connection to the commit tree 
git stash save -- "checkout stash before release."
git branch distribution
git checkout distribution && \
git rebase --onto master distribution
# find . -name distribution -prune -o -print0 | xargs -0 rm -r
rm ./.git/info/exclude && mv ./.gitignore ./.git/info/exclude # deleting .gitignore will make it faster, by preventing node_modules from being processed by tools while deleting files.
find . \
    -path ./distribution -prune -o \
    -path ./.git -prune -o \
    -path ./node_modules -prune -o \
    -exec rm -rf {} \; 2> /dev/null
cp -r ./distribution/* .
git add -A && git commit -a -m '🏗 Release.' && git tag $version; 
git checkout master && \
git stash pop

