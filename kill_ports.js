const kill = require('kill-port');
const utils = require('./dist/src/infra/utils/Logger');

const logger = new utils.Logger();
kill(3000, 'tcp').then((result) => {
  logger.info({
    label: 'kill_ports.js',
    message: result
  });
}).catch(error => {
  logger.info({
    label: 'kill_ports.js',
    message: error
  });
});