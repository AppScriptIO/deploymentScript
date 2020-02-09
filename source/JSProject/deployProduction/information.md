### production stack
# 1.
docker-machine ssh $VM-1
VolumeBasePath=/mnt/datadisk-1/taleb
sudo mkdir -p $VolumeBasePath/rethinkdbData

# 2. Add raw Github reverse proxy file to Redbird proxy.

# 3.
docker stack deploy -c ./setup/container/production.dockerStack.yml talebwebapp



- Check also `@deployment/appDeploymentLifecycle' for more production scripts.

