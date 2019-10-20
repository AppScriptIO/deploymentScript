const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const { sync: binaryExist } = require('command-exists')

/*
- zsh + oh my zsh 
    - Theme:
        - https://github.com/romkatv/powerlevel10k
        - https://github.com/bhilburn/powerlevel9k/wiki/Install-Instructions#step-1-install-powerlevel9k
    - plugin: 
        - https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md
        - https://github.com/zsh-users/zsh-syntax-highlighting/blob/master/INSTALL.md
        - https://github.com/zsh-users/zsh-completions
        - https://github.com/zsh-users/zsh-history-substring-search
    - https://github.com/robbyrussell/oh-my-zsh
    - Note when installing oh-my-zsh - To prevent issues with line endings when installing `oh-my-zsh` from curl or get from github repo, set git config for crlf to false. i.e. using shell `git config --global core.autocrlf false`
    - https://www.youtube.com/watch?v=ZAYDoE9Wmkc
    - change default shell - http://www.peachpit.com/articles/article.aspx?p=659655&seqNum=3
*/
export function install() {
  if (binaryExist('zsh')) console.log('✔ zsh is installed.')
  else {
    childProcess.execSync(`sudo apt-get install -y zsh`, childProcessOption)
    // oh-my-zsh
    childProcess.execSync(`sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"`, childProcessOption)
    // plugins
    childProcess.execSync(`git clone https://github.com/zsh-users/zsh-autosuggestions \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`, childProcessOption)
    childProcess.execSync(`git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`, childProcessOption)
    childProcess.execSync(`git clone https://github.com/zsh-users/zsh-completions \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-completions`, childProcessOption)
    childProcess.execSync(`git clone https://github.com/zsh-users/zsh-history-substring-search \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-history-substring-search`, childProcessOption)
    // powerlevel10k theme
    childProcess.execSync(`git clone https://github.com/romkatv/powerlevel10k.git \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/powerlevel10k`, childProcessOption)
    // set default shell - make zsh default shell.
    childProcess.execSync(`sudo chsh --shell $(which zsh)`, childProcessOption)
    childProcess.execSync(`echo "Current shell: $SHELL"`, childProcessOption)
  }
}
