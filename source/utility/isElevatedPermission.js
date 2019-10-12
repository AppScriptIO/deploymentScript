export const isRootPermission = () => process.getuid && process.getuid() === 0 // check if process running with root permissions.
