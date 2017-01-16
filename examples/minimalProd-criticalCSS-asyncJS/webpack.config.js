/* eslint-disable import/no-unresolved */
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
/* eslint-enable import/no-unresolved */

module.exports = {
	entry: {
		app: './app',
		// separate entry for critical css
		critical_css: './app/critical.css'
	},
	output: {
		path: './build',
		filename: '[name].js'
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract('style', 'css')
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader'
			}
		]
	},
	// only needed to resolve local version for testing
	// in your code install properly as a package
	resolve: {
		alias: {
			"html-webpack-template-pug": "../../"
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: false,
			template: 'index.pug',
			inline: 'critical_css',
			excludeJSChunks: 'critical_css',	// don't include specific chunks in scripts (when .js is a byproduct of already extracted .css)
			appMountId: 'app',
			mobile: true,
			title: 'App'
		}),
		new ExtractTextPlugin('[name].css')
	]
};
