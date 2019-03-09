# https://help.github.com/articles/splitting-a-subfolder-out-into-a-new-repository/
# This will create a new branch with one commit that adds everything in HEAD. It doesn't alter anything else, so it's completely safe. 
# Used to create a release from a repo where the release will contain a single commit.
git branch distribution $(echo "Release 1.0.3" | git commit-tree HEAD^{tree}) && git checkout distribution \
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
git tag -a 1.0.3 -m "Realse tag 1.0.3" && \
git push origin 1.0.3 && \
git checkout master && \
git branch -D distribution
