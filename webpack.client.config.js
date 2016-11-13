var path = require('path');
var webpack = require('webpack');
var fs = require('fs-extra');
var Util = require('./Util.js');
var WriteFilePlugin = require('write-file-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WriteFileWebpackPlugin = require('write-file-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var getHash = Util.getHash;
var getEntry = Util.getEntry;
var pages = [];
var isProduction = process.env.NODE_ENV === 'production' ? true : false;

var config = {
    entry: getEntry('src/views/page/**/*.entry.js?(x)', 'src/views/page/'),
    output: {
        path: path.join(process.cwd(), './dist/public/static'),
        publicPath: '/static/',
        filename: 'scripts/[name]' + getHash(isProduction) + '.js',
        chunkFilename: 'scripts/[id]' + getHash(isProduction) + '.js'
    },
    resolve: {
        alias: {
            bootstrap:  path.resolve('bower_components/bootstrap/dist/css/bootstrap.css'),
            jquery: path.resolve('node_modules/jquery/dist/jquery.min.js'),
            datepicker: path.resolve('bower_components/datepicker/dist/js/bootstrap-datepicker.min.js'),
            datepickercss: path.resolve('bower_components/datepicker/dist/css/bootstrap-datepicker.min.css'),
            datepickercn: path.resolve('bower_components/datepicker/dist/locales/bootstrap-datepicker.zh-CN.min.js')
        },
        extensions: ['', '.js', '.css']
    },
    ejsLoader: {
        evaluate: /\{\{(.+?)\}\}/gim,
        interpolate: /\{\{=(.+?)\}\}/gim,
        escape: /\{\{-(.+?)\}\}/gim
    },
    module: {
        loaders: [ //加载器
            {
                test: /\.css$/,
                    loader: isProduction ? ExtractTextPlugin.extract('style-loader', 'css-loader') : 'style!css'
            },
            {
                test: /\.less$/,
                loader: isProduction ? ExtractTextPlugin.extract('css!less') : 'style!css!less'
            },
            {
                test: /\.html$/,
                loader: "html?-minimize"
            },
            {
                test: /\.html/,
                loader: 'ejs-loader'
            },
            {
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=fonts/[name]' + getHash(isProduction) + '.[ext]'
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                loader: 'url-loader?limit=1024&name=imgs/[name]' + getHash(isProduction) + '.[ext]'
            }
            ,
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: ['babel'],
                query: {
                    presets: ['es2015','react']
                }
            }

        ]
    },
    plugins: [
        new ExtractTextPlugin('styles/[name]' + getHash(isProduction) + '.css'),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            bootstrap: "bootstrap",
            datepicker: 'datepicker',
            datepickercss: 'datepickercss',
            datepickercn: 'datepickercn',
            _: "underscore"
        })
    ]
};

if (!isProduction) {
    var pluginList = [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new WriteFileWebpackPlugin({
            test: /\.html/,
            log: false,
            useHashIndex: false
        })
    ];
    Array.prototype.push.apply(config.plugins, pluginList);

    for (var i in config.entry) {
        config.entry[i].push('webpack-hot-middleware/client?reload=true')

    }
}
else {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({})
    )
}

// html
pages = Object.keys(getEntry('src/views/page/**/*.html', 'src/views/page/'))
pages.forEach(function(pathname) {
    var conf = {
        filename: '../../app/views/page/' + pathname + '.html', //生成的html存放路径，相对于output.path
        template: '!!ejs!src/views/page/' + pathname + '.html', // 相对cwd
        inject: false,
        showErrors: true,
        cache: true
    };
    if (pathname in config.entry) {
        conf.inject = false;
        conf.chunks = [pathname];
        conf.hash = false;
    }
    config.plugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = config;
