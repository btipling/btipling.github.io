const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanupPlugin = require('webpack-cleanup-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';
const root = path.resolve(__dirname);
const tsSrc = path.join(root, 'ts');
const dist = path.join(root, 'build');
const app = path.join(tsSrc, 'main.ts');
const publicPath = '/';

const webpackConfig = {
    entry: {
        app,
    },
    output: {
        filename: `[name].[hash].js`,
        chunkFilename: '[name].[chunkhash].js',
        path: dist,
        publicPath: publicPath,
    },
    name: 'client',
    target: 'web',
    devtool: 'source-map',
    resolve: {
        modules: [tsSrc, 'node_modules'],
        extensions: ['.ts', '.js', '.json'],
    },
    module: {
        rules: [],
    }
};

webpackConfig.plugins = [
    new webpack.DefinePlugin({
        NODE_ENV,
    }),
    new HtmlWebpackPlugin({
        template: path.join('html', 'index.html'),
        hash: false,
        filename: 'index.html',
        inject: 'body',
    }),
];

if (isProd) {
    webpackConfig.plugins.push(
        new webpack.optimize.OccurrenceOrderPlugin(),
        new UglifyJSPlugin({
            uglifyOptions: {
                compress: {
                    unused: true,
                    dead_code: true,
                    warnings: false
                }
            }
        }),
        new webpack.optimize.AggressiveMergingPlugin()
    )
} else {
    webpackConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
}

function addRules(rules) {
    webpackConfig.module.rules = webpackConfig.module.rules.concat(rules);
}

// TypeScript and source maps
addRules([{
        test: /\.ts$/,
        loader: 'ts-loader'
    },
    {
        test: /\.js$/,
        loader: 'source-map-loader',
        enforce: 'pre',
        exclude: [path.join(root, 'node_modules')]
    }
]);

module.exports = webpackConfig;
