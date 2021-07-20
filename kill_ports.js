const kill = require('kill-port');

kill(3000, 'tcp').then(console.log).catch(console.log)
kill(3001, 'tcp').then(console.log).catch(console.log)