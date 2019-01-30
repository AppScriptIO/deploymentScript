const inspector = require('inspector');
inspector.open(...[,,],true)


console.log('• before debugger')

debugger;

console.log('• after debugger')