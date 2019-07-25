const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const { sync: binaryExist } = require('command-exists')

export function install() {
  if (binaryExist('zsh')) console.log('✔ zsh is installed.')
  else {
    childProcess.execSync(`sudo apt-get install -y zsh`, childProcessOption)
    // oh-my-zsh
    childProcess.execSync(`sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"`, childProcessOption)
    // plugins
    childProcess.execSync(`git clone https://github.com/zsh-users/zsh-autosuggestions \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`, childProcessOption)
    childProcess.execSync(`git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`, childProcessOption)
    childProcess.execSync(`git clone https://github.com/zsh-users/zsh-completions ~/.oh-my-zsh/custom/plugins/zsh-completions`, childProcessOption)
    childProcess.execSync(`git clone https://github.com/zsh-users/zsh-history-substring-search \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-history-substring-search`, childProcessOption)
    // powerlevel10k theme
    childProcess.execSync(`git clone https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k`, childProcessOption)
    // set default shell - make zsh default shell.
    childProcess.execSync(`sudo chsh --shell $(which zsh)`, childProcessOption)
    childProcess.execSync(`echo "Current shell: $SHELL"`, childProcessOption)
  }
}
