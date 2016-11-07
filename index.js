/**
 * @overview
 *
 * @author
 * @version 2016/11/07
 */

var program = require('commander');

program
  .version('0.0.1')
  .option('-c, --client', 'build client')
  .option('-s, --server', 'build server')
  .parse(process.argv);

if (program.client) {
    var buildClient = require('./build-client.js');
}

if (program.server) {
    var buildServer = require('./build-server.js');
}


