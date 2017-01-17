/**
 * @overview
 *
 * @author
 * @version 2016/10/12
 */
var path = require('path');
var http = require('http');
var fs = require('fs-extra');
var webpack = require('webpack');
var clientConfig = require('./webpack.client.config.js');
var serverConfig =require('./webpack.server.config.js');
var server = require('bdj-container/index-2.js')
var statsConf = require('./Util.js').stats;
var isProduction = process.env.NODE_ENV === 'production' ? true : false;
var clientCompiler = null;
var serverCompiler = null;
var app = null;

console.log('Building, about takes tens of seconds, please wait...')

// clean
fs.removeSync(path.join(process.cwd(), './dist'));

serverCompiler = webpack(serverConfig);
clientCompiler = webpack(clientConfig);

if (isProduction) {

    // packaging deps
    var pStartTime = new Date();
    fs.copy(
        path.join(process.cwd(), './node_modules'),
        path.join(process.cwd(), './dist/node_modules'),
        function () {
            console.log('Packaging dependences finish: ', (new Date() - pStartTime)/1000 + 's');
        }
    );
    serverCompiler.run(function (err, stats){
        if(!processError(err, stats)) return;
        console.log('Server build '+ stats.hash +' in '+ (stats.endTime - stats.startTime)/1000 +'s');
    });

    clientCompiler.run(function (err, stats){
        if(!processError(err, stats)) return;
        console.log('Client build '+ stats.hash +' in '+ (stats.endTime - stats.startTime)/1000 +'s');
    });

    return;

}

serverCompiler.watch({
    aggregateTimeout: 300 // wait so long for more changes
}, function (err, stats){
    if(!processError(err, stats)) return;
    console.log('Server build '+ stats.hash +' in '+ (stats.endTime - stats.startTime) +'ms');
    reloadApp();
})

function processError(err, stats) {
    if (err) {
        console.error(err.stack || err);
        if (err.details) {
            console.error(err.details);
        }
        return;
    }
    if (stats.hasErrors()) {
        const info = stats.toString(Object.assign({}, statsConf, {errors: true}));
        console.error(info);
        return;
    }
    return true;
}


function _runApp() {
    app = server.createApp({
        "publicPath": path.join(process.cwd(), "/dist/public"),
        "appPath": path.join(process.cwd(), "/dist/app"),
        "port": 8080
    });
    var dev = require('webpack-dev-middleware')(clientCompiler, {
        noInfo: true,
        quiet: true,
        publicPath: '/static/',
        reporter: function (reporterOptions) {
            var state = reporterOptions.state;
            var stats = reporterOptions.stats;
            var options = reporterOptions.options;
            if(state) {
                if (stats.hasErrors()) {
                    console.log(stats.toString(Object.assign({},statsConf, {errors: true})));
                }
            }
        }
    });
    dev.waitUntilValid(function (){
        console.info('Express server listening on port ' + app.get('port'));
    })
    app.use(dev);
    app.use(require("webpack-hot-middleware")(clientCompiler));
    http.createServer(app).listen(app.get('port'), function(err){
        if (err) {
            console.log(err)
        }
    });
}

function reloadApp() {
    if(!app) {
        _runApp();
    } else{
        // clean custom module require cache
         Object.keys(require.cache).forEach(function(key) {
             if(/(\/dist\/app\/|\/mock\/)/g.test(key)) {
                delete require.cache[key]
             }
         })

        // clear router, remove old router and add new one
        if (app._router && app._router.stack) {
            var layer = null;
            for (var i = 0; i < app._router.stack.length; i ++) {
                layer = app._router.stack[i];
                if(layer.name === 'router') {
                    app._router.stack.splice(i,1);
                    try{
                        server.reloadRouter();
                    }
                    catch(e) {
                        console.log(e);
                    }
                    break;
                }
            }
        }
    }
}
