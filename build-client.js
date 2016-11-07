/**
 * @overview
 *
 * @author
 * @version 2016/10/12
 */
var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.client.config.js');
var isProduction = process.env.NODE_ENV === 'production' ? true : false;
var compiler = webpack(config);

if (isProduction) {
    compiler.run(function (err, stat){
        if(err) {
            console.log(err);
            return;
        }
        console.log('Client build: ', (stat.endTime - stat.startTime)/1000 + 's');
    });

    return;
}

compiler.plugin('done', function(stat) {
    console.log('Client build: ', (stat.endTime - stat.startTime)/1000 + 's');
});
var server = new WebpackDevServer(compiler, {
    hot: true,
    quiet: true,
    noInfo: false,
    clientLogLevel: 'error',
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    },
    publicPath: "/static/",
    proxy: {
        "**": {
            target: "http://localhost:8080",
            logLevel: 'error'
        }
    }
});
server.listen(8082, "localhost", function(err) {
    if(err) {
        console.error('Client build failed:', err);
    }
    else {
        console.log('Browse to http://localhost:8082' );
    }
});





