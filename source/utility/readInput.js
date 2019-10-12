import readline from 'readline'

export const readInput = question => {
  const readlineInstance = readline.createInterface({ input: process.stdin, output: process.stdout })
  readlineInstance.setPrompt(question)
  readlineInstance.prompt()
  return new Promise((resolve, reject) => {
    let response
    readlineInstance.on('line', userInput => {
      response = userInput
      readlineInstance.close()
    })
    readlineInstance.on('close', () => {
      resolve(response)
    })
  })
}
