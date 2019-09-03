const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: ['@babel/polyfill', 'bootstrap-loader', './src/js/main.js'],
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'bundle.js',
	},
	devServer: {
		// inline: false,
		contentBase: path.resolve(__dirname, "./public"),
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './src/pug/index.pug'),
			filename: './index.html',
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: [
					{ loader: 'babel-loader', options: {
						cacheDirectory: true
					}},
				]
			},
			{
				test: /\.css$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader", options: {
						sourceMap: true
					}},
				]
			},
			{
				test: /\.scss$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader", options: {
						sourceMap: true
					}},
					{ loader: "sass-loader", options: {
						sourceMap: true
					}},
				]
			},
			{
				test: /\.(png|woff|woff2|eot|ttf)$/,
				use: [
					{ loader: 'url-loader', options: {
						limit: 100000
					}},
				]
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader'
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader'
			},
			{
				test: /\.html$/,
				loader: 'html-loader'
			}
		]
	}
};
