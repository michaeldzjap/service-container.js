const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        simple: './src/simple',
        concrete: './src/concrete',
        interface: './src/interface',
        singleton: './src/singleton'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                exclude: path.resolve(__dirname, 'node_modules'),
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    devtool: 'cheap-module-eval-source-map',
    optimization: {
        noEmitOnErrors: true
    }
};
