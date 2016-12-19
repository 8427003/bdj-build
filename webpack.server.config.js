var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var isProduction = process.env.NODE_ENV === 'production' ? true : false;

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

var config = {
    entry: ['babel-polyfill', './src/route.js'],
    target: 'node',
    externals: nodeModules,
    output: {
        path: process.cwd(),
        libraryTarget: 'commonjs2',
        filename: './dist/app/route.js'
    },
    resolve: {
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules'),
        ],
        alias: {
            bootstrap:  path.resolve('bower_components/bootstrap/dist/css/bootstrap.min.css'),
            jquery: path.resolve('node_modules/jquery/dist/jquery.min.js'),
            datepicker: path.resolve('bower_components/datepicker/dist/js/bootstrap-datepicker.min.js'),
            datepickercss: path.resolve('bower_components/datepicker/dist/css/bootstrap-datepicker.min.css'),
            datepickercn: path.resolve('bower_components/datepicker/dist/locales/bootstrap-datepicker.zh-CN.min.js')
        },
        extensions: ['.js', '.css', '.json']
    },
    node: {
        __dirname  :  false,
		__filename : false
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'src/config', to: 'dist/app/config' }
        ])
    ],
    module: {
        loaders: [ //加载器
            {
                test: /\.css$/,
                loader: 'css-loader/locals'
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "css-loader/locals"
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
                loader: 'file-loader?emitFile=false&name=fonts/[name].[ext]'
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                loader: 'url-loader?emitFile=false&limit=1&name=imgs/[name].[ext]'
            }
            ,
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015','react']
                }
            },
            {
                test: /\.json$/,
                loader: 'json'
            }

        ]
    }
};

if (!isProduction) {
    config.devtool = 'eval-source-map';
    config.plugins.push(
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true,
            entryOnly: false
        })
    )
}

module.exports = config;
