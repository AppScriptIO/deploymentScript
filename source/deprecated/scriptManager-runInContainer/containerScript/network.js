// NETWORK
let networkName = 'scriptManager'
{
  let createNetwork = spawnSync('docker', [`network create ${networkName}`], {
    detached: false,
    shell: true,
    stdio: ['inherit', 'inherit', 'ignore'],
    env: process.env, // pass environment variables like process.env.PWD to spawn process
  })
  if (createNetwork.status == 1) console.log('Docker network already exist.')
}
