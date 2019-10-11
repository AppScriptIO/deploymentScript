# nodegit npm dependency
- Note that the package versin may not support the latest nodejs version, e.g. nodegit@next supports Nodejs 12 while the former versions throw errors during installation.

# required preinstall packages: 
- https://packages.debian.org/source/sid/libgit2 https://github.com/libgit2/libgit2
  (do not use development version `libgit2-dev`, use the stable one instead.)

- https://packages.debian.org/source/jessie/openssl
 
# If errors occur try installing the following packages:
### https://stackoverflow.com/questions/37634883/installing-libgit2-and-pygit2-on-debian-docker
- ```
    DEBIAN_FRONTEND=noninteractive sudo apt-get update -qq && DEBIAN_FRONTEND=noninteractive sudo apt-get install -yqq openssl libssl-dev libgit2-27 libssh2-1-dev  libffi-dev  zlib1g-dev python-cffi python-dev  python-pip build-essential cmake  gcc  pkg-config  git libhttp-parser-dev python-setuptools wget
  ```

