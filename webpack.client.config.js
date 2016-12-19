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
    entry: getEntry('src/views/**/*.entry.js?(x)', 'src/views/'),
    output: {
        path: path.join(process.cwd(), './dist/public/static'),
        library: 'window=window;window\["[name]".split("/")[1]\]',
        libraryTarget: 'var',
        publicPath: '/static/',
        filename: 'scripts/[name]' + getHash(isProduction) + '.js',
        chunkFilename: 'scripts/[id]' + getHash(isProduction) + '.js'
    },
    resolve: {
        alias: {
            bootstrap:  path.resolve('bower_components/bootstrap/dist/css/bootstrap.min.css'),
            jquery: path.resolve('node_modules/jquery/dist/jquery.min.js'),
            datepicker: path.resolve('bower_components/datepicker/dist/js/bootstrap-datepicker.min.js'),
            datepickercss: path.resolve('bower_components/datepicker/dist/css/bootstrap-datepicker.min.css'),
            datepickercn: path.resolve('bower_components/datepicker/dist/locales/bootstrap-datepicker.zh-CN.min.js')
        },
        extensions: ['.js', '.css']
    },
    resolveLoader: {
        moduleExtensions: ["-loader"]
    },
    module: {
        rules: [ //加载器
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "less-loader"
                    }
                ]
            },
            {
                test: /\.html/,
                loader: "ejs-loader",
                options: {
                    evaluate: /\{\{(.+?)\}\}/gim,
                    interpolate: /\{\{=(.+?)\}\}/gim,
                    escape: /\{\{-(.+?)\}\}/gim
                }
            },
            {
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file?name=fonts/[name]' + getHash(isProduction, 'hash') + '.[ext]'
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                loader: 'url?limit=1024&name=imgs/[name]' + getHash(isProduction, 'hash') + '.[ext]'
            }
            ,
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: require.resolve("react"),
                loader: "expose?React"
            },
            {
                test: require.resolve("react-dom"),
                loader: "expose?ReactDOM"
            }
        ]
    },
    plugins: [
        new CommonsChunkPlugin({ name: 'vendor', filename: 'scripts/vendor'+ getHash(isProduction) +'.js' }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            _: "lodash"
        })
    ]
};
if (!isProduction) {
    var pluginList = [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new WriteFileWebpackPlugin({
            test: /\.html$/,
            log: false,
            useHashIndex: false
        })
    ];
    Array.prototype.push.apply(config.plugins, pluginList);
    for (var i in config.entry) {
        config.entry[i].unshift('webpack-hot-middleware/client?reload=true&quiet=true')

    }
}
else {
    config.module.rules[0] = {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(["css-loader?minimize"])
    }
    config.module.rules[1] = {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract(["css-loader?minimize", "less-loader"])
    }
    config.plugins.push(
        new ExtractTextPlugin({filename: 'styles/[name]' + getHash(isProduction, 'contenthash') + '.css'}),
        new webpack.optimize.UglifyJsPlugin({})
    )
}
config.entry.vendor = [
    'react',
    'react-dom'
]

// html
 pages = Object.keys(getEntry('src/views/**/*.html', 'src/views/'))

pages.forEach(function(pathname) {

    var conf = {
        filename: '../../app/views/' + pathname + '.html', //生成的html存放路径，相对于output.path
        template: 'src/views/' + pathname + '.html', // 相对cwd
        inject: false,
        showErrors: true,
        cache: true
    };
    if (pathname in config.entry) {
        conf.inject = false;
        conf.chunks = ['vendor', pathname];
        conf.hash = false;
    }
    config.plugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = config;
