module.exports = config:
	modules: wrapper: false
	minify: yes
	plugins: 
		babel: pattern: /\.(es6|jsx)$/
		uglify: ignored: /angular-fluent-fixture.js/
	paths: 
		public: 'dist'
		watched: [ 'src' ]
	files:
		javascripts: 
			joinTo: 
				'angular-fluent-fixture.js': /src/
				'angular-fluent-fixture.min.js': /src/
