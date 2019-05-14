### https://help.github.com/articles/splitting-a-subfolder-out-into-a-new-repository/
# This will create a new branch with one commit that adds everything in HEAD. It doesn't alter anything else, so it's completely safe. 
# Used to create a release from a repo where the release will contain a single commit.
# branch for distribution - squashing all commits and create a single commit branch and tag
#! DEPRECATED
RELEASE_NUMBER=1.0.3
git branch distribution $(echo "Release $(RELEASE_NUMBER)" | git commit-tree HEAD^{tree}) && git checkout distribution \
&& git filter-branch \
    --tree-filter 'find . ! \( -path "./configuration*" -o \
                               -path "./package.json" -o \
                               -path "./README.md" -o \
                               -path "./yarn.lock" -o \
                               -path "./source" -o \
                               -path "." \) \
                        -exec rm -fr {} +' \
    --prune-empty -f \
    distribution && \
git tag -a $(RELEASE_NUMBER) -m "Realse tag $(RELEASE_NUMBER)" && \
git push origin $(RELEASE_NUMBER) && \
git checkout master && \
git branch -D distribution