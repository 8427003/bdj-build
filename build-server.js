/**
 * @overview
 *
 * @author
 * @version 2016/10/12
 */
var webpack = require('webpack');
var serverConfig = require('./webpack.server.config.js');
var serverCompier = webpack(serverConfig);
var isProduction = process.env.NODE_ENV === 'production' ? true : false;

if (isProduction) {
    serverCompier.run(function (err, stat){
        if(err) {
            console.log(err);
            return;
        }
        console.log('Server build: ', (stat.endTime - stat.startTime)/1000 + 's');
    });

    return;
}

// dev
var nodemon  = require('nodemon');
var hasStart = false;
serverCompier.watch({
    aggregateTimeout: 300 // wait so long for more changes
},function (err, stat){
    if(err) {
        console.log(err);
        return;
    }
    console.log('Server build: ', (stat.endTime - stat.startTime)/1000 + 's');

    if (hasStart) {
        console.log('Server:restart');
        nodemon.emit('restart');
    }
    else {
        // nodemon.emit('quit');
        var monitor = nodemon({
            script: './dist/app.js',
            "watch": [
                "./dist/app.js"
            ]
        });

        // https://github.com/JacksonGariety/gulp-nodemon/issues/77
        process.once('SIGINT', function() {
            monitor.once('exit', function() {
                process.exit();
            });
        });
        hasStart = true;
    }
})






