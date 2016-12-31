var HtmlWebpackPlugin = require('html-webpack-plugin');	//eslint-disable-line import/no-unresolved

module.exports = {
	entry: {
		app: './app'
	},
	output: {
		path: './build',
		filename: '[name].js'
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				loaders: ['style', 'css']
			}
		]
	},
	devServer: {
		historyApiFallback: true,
		inline: true,
		stats: 'errors-only'
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
			template: '!!pug-loader!./index.pug',
			appMountId: 'app',
			mobile: true,
			title: 'App',
			injectExtras: {
				head: [
					"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css",
					{
						"tag": "meta",
						"name": "description",
						"content": "A description of the page"
					}
				],
				body: [
					"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js",
					"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js",
					{
						"tag": "noscript",
						"innerHTML": "JavaScript is disabled in your browser. <a href='http://www.enable-javascript.com/' target='_blank'>Here</a> is how to enable it."
					}
				]
			}
		})
	]
};
