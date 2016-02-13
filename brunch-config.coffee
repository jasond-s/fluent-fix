module.exports = config:
	modules: wrapper: false
	minify: yes
	plugins: 
		babel: pattern: /\.(es6|jsx|spec.jsx)$/
		uglify: ignored: /fluent-fix.js|fluent-fix.spec.js/
	paths: 
		public: 'dist'
		watched: [ 'src', 'test' ]
	files:
		javascripts: 
			joinTo: 
				'fluent-fix.js': /src/
				'fluent-fix.min.js': /src/
				'fluent-fix.spec.js': /test/
			order:
		      before: [ 
		      	'src/uuid-crypto.jsx',
		      	'src/utilities.jsx',
		      	'src/generator.jsx'
		      ]
