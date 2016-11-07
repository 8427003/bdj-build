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

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    hot: true,
    quiet: true,
    noInfo: false,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    },
    publicPath: "/static/",
    stats: {
        colors: true
    },
    proxy: {
        "**": "http://localhost:8083"
    }
});
server.listen(8080, "localhost", function() {});




