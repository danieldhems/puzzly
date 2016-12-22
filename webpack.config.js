module.exports = {
	context: __dirname + '\\src\\js',
	output: {
		path: __dirname + '\\dist\\',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
		    {
		      test: /\.js?$/,
		      exclude: /(node_modules|bower_components)/,
		      loader: 'babel', // 'babel-loader' is also a legal name to reference
		    	query: {
		          presets: ['es2015']
		        }
		    }
	  	]
	},
	resolve: {
		extensions: ['', '.js']
	}
};