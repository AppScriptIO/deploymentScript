// Convert an object of Key-String pair to ann array of strings `--env <key>=<value>` for passing process.env to docker run command in child process.
export function convertObjectToDockerEnvFlag(
  envObject, // Object of key - string pairs
) {
  let dockerEnvStringArray = []
  Object.entries(envObject).forEach(([key, value]) => {
    dockerEnvStringArray.push(`--env "${escapeWithBackslash(key)}=${escapeWithBackslash(value)}"`) // escape special characters
  })

  return dockerEnvStringArray
}

function escapeWithBackslash(string) {
  // escape using JSON.stringify
  let jsonString = JSON.stringify(String(string))
  let escapedString = jsonString.substring(1, jsonString.length - 1)
  return escapedString
}
