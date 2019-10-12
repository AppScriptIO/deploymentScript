const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }

/* 
NodeGit npm packge - Required preinstall packages: 
    - https://packages.debian.org/source/sid/libgit2 https://github.com/libgit2/libgit2
    libgit2 unix package is a dependency for nodegit npm package.
    (do not use development version `libgit2-dev`, use the stable one instead.)
    - Optional dependencies: https://salsa.debian.org/debian/libgit2#optional-dependencies
        - https://packages.debian.org/source/jessie/openssl
Note: that the package versin may not support the latest nodejs version, e.g. nodegit@next supports Nodejs 12 while the former versions throw errors during installation.
Note: the package exists for latest debian/ubuntu releases. Some releases support only older versions.

# If errors occur try installing the following packages:
https://stackoverflow.com/questions/37634883/installing-libgit2-and-pygit2-on-debian-docker
```
    DEBIAN_FRONTEND=noninteractive sudo apt-get update -qq && DEBIAN_FRONTEND=noninteractive sudo apt-get install -yqq openssl libssl-dev libgit2-27 libssh2-1-dev  libffi-dev  zlib1g-dev python-cffi python-dev  python-pip build-essential cmake  gcc  pkg-config  git libhttp-parser-dev python-setuptools wget
```
*/
export function install() {
    // for Ubuntu 19+ or Debian 10+ (i.e. package `libgit2-27 must exist)
    childProcess.execSync([
        'CHECK="$(dpkg -l | grep libgit2-27 2>/dev/null)"',
        `if [ -z "$CHECK" ]; then 
            echo 'Machine global peer dependency "nodegit" is required. Checking for libgit2...\n'; 
            if ! [ $(id -u) = 0 ]; then 
                echo "Must be root to run script"; 
            fi && 
            DEBIAN_FRONTEND=noninteractive sudo apt-get install -yqq libgit2-27 openssl; 
        else 
            echo 'nodegit is installed.'; 
        fi`
    ].join(' && \\\n'), childProcessOption)
}

