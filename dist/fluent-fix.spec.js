(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
"use strict";

describe('Fixture builder', function () {

	var fixture = null;
	var testClass = null;
	var fluentTestClass = null;
	var complexFixture = null;

	beforeEach(function () {
		fixture = FluentFix.fixture({
			something: 5,
			thing: "Hello World",
			stuff: ["Good Bye", 5],
			noStuff: []
		});

		complexFixture = FluentFix.fixture({
			something: 5,
			thing: "Hello World",
			stuff: fixture()
		});

		testClass = fixture();
		complexTestClass = complexFixture();

		fluentTestClass = fixture.builder().withSomething(9001).withThing('TEST_01').withStuff(['TEST_01']).withNoStuff(['TEST_02']).build();
	});

	describe('with a simple object', function () {

		it('will create a new fixture for an object', function () {
			expect(testClass).toBeTruthy();
		});

		it('will set the default value for a number', function () {
			expect(testClass.something).toEqual(jasmine.any(Number));
		});

		it('will set the default value for a string', function () {
			expect(testClass.thing).toEqual(jasmine.any(String));
		});

		it('will set the default value for an empty array', function () {
			expect(testClass.noStuff).toEqual([]);
		});

		it('will set the default value for an array', function () {
			expect(testClass.stuff).toEqual([jasmine.any(String), jasmine.any(Number)]);
		});

		it('will fluently create a new fixture for an object', function () {
			expect(fluentTestClass).toBeTruthy();
		});

		it('will fluently set the default value for a number', function () {
			expect(fluentTestClass.something).toBe(9001);
		});

		it('will fluently set the default value for a string', function () {
			expect(fluentTestClass.thing).toBe('TEST_01');
		});

		it('will fluently set the default value for an empty array', function () {
			expect(fluentTestClass.noStuff).toEqual(['TEST_02']);
		});

		it('will fluently set the default value for an array', function () {
			expect(fluentTestClass.stuff).toEqual(['TEST_01']);
		});

		it('will keep sensible defaults from load', function () {
			var fluentTestClassWithDefaults = fixture.builder().withSomething(9002).build();

			expect(fluentTestClassWithDefaults.something).toBe(9002);
			expect(fluentTestClassWithDefaults.thing).toEqual(jasmine.any(String));
			expect(testClass.noStuff).toEqual([]);
			expect(testClass.stuff).toEqual([jasmine.any(String), jasmine.any(Number)]);
		});
	});

	describe('with a complex object', function () {

		it('will create nested objects', function () {
			expect(complexTestClass).toBeTruthy();
		});

		it('will map the nested object and defaults', function () {

			expect(complexTestClass.something).toEqual(jasmine.any(Number));

			expect(complexTestClass.stuff.thing).toEqual(jasmine.any(String));
			expect(complexTestClass.stuff.something).toEqual(jasmine.any(Number));
			expect(complexTestClass.stuff.stuff).toEqual([jasmine.any(String), jasmine.any(Number)]);
		});

		it('will keep sensible defaults from load', function () {
			var fluentTestClassWithDefaults = fixture.builder().withSomething(function () {
				return 9002;
			}).withStuff(function () {
				return fixture.builder().withSomething(function () {
					return 9002;
				}).build();
			}).build();

			expect(fluentTestClassWithDefaults.something).toEqual(9002);
			expect(fluentTestClassWithDefaults.thing).toEqual(jasmine.any(String));

			expect(fluentTestClassWithDefaults.stuff.something).toEqual(9002);
			expect(fluentTestClassWithDefaults.stuff.thing).toEqual(jasmine.any(String));
		});
	});

	describe('with a builder instance', function () {

		it('will keep sensible defaults from load', function () {
			var builder = fixture.builder().withSomething(9002);

			var fluentTestClassWithDefaults1 = builder.build();
			var fluentTestClassWithDefaults2 = builder.build();

			expect(fluentTestClassWithDefaults1.something).toEqual(9002);
			expect(fluentTestClassWithDefaults1.thing).toEqual(jasmine.any(String));

			expect(fluentTestClassWithDefaults2.something).toEqual(9002);
			expect(fluentTestClassWithDefaults2.thing).toEqual(jasmine.any(String));
		});
	});

	describe('with a complex nested object', function () {

		it('will keep sensible defaults from load', function () {
			var complexFixture = FluentFix.fixture({
				something: 5,
				thing: {
					something: 'hello',
					thing: {
						something: 'world',
						thing: {
							something: 5
						}
					}
				}
			});

			var complex = complexFixture();

			expect(complex.something).toEqual(jasmine.any(Number));
			expect(complex.thing.something).toEqual(jasmine.any(String));
			expect(complex.thing.thing.something).toEqual(jasmine.any(String));
			expect(complex.thing.thing.thing.something).toEqual(jasmine.any(Number));
		});
	});

	describe('with a function return in an object', function () {

		var functionFixture = null;

		beforeEach(function () {
			functionFixture = FluentFix.fixture({
				something: 5,
				thing: function thing() {
					return 5;
				}
			});
		});

		it('will create a real object', function () {
			expect(functionFixture()).toBeTruthy();
		});

		it('will keep sensible defaults from load', function () {
			var testClass = functionFixture.builder().withThing(function () {
				return function () {
					return 9001;
				};
			}).build();

			expect(testClass.thing()).toEqual(9001);
		});
	});

	describe('with an array of complex objects', function () {

		var functionFixture = null;

		beforeEach(function () {
			functionFixture = FluentFix.fixture({
				something: [{ thing: 1 }, 2, 'three']
			});
		});

		it('will create a real object', function () {
			expect(functionFixture()).toBeTruthy();
		});

		it('will keep the types for all the array items', function () {
			var testClass = functionFixture();

			expect(testClass.something).toEqual(jasmine.any(Array));

			expect(testClass.something[0]).toEqual(jasmine.any(Object));
			expect(testClass.something[0].thing).toEqual(jasmine.any(Number));
			expect(testClass.something[1]).toEqual(jasmine.any(Number));
			expect(testClass.something[2]).toEqual(jasmine.any(String));
		});
	});
});

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

describe('Generators for fixture values', function () {

	var fixture = null;
	var testClass = null;

	describe('standard generators', function () {

		beforeEach(function () {
			fixture = FluentFix.fixture({
				something: new FluentFix.Generator.For.Number(0, 100)
			});

			testClass = fixture();
		});

		it('should call gen when used in fixture', function () {
			expect(testClass.something).toEqual(jasmine.any(Number));
		});
	});

	describe('object generator', function () {

		describe('simple object', function () {

			beforeEach(function () {
				fixture = new FluentFix.Generator.Object({
					something: 5
				});

				testClass = fixture.generate();
			});

			it('should return a new object when generating', function () {
				expect(testClass.something).toEqual(jasmine.any(Number));
			});
		});

		describe('complex object', function () {

			beforeEach(function () {
				fixture = new FluentFix.Generator.Object({
					something: 5,
					other: {
						thing: 'TEST_01'
					}
				});

				testClass = fixture.generate();
			});

			it('should return a new object when generating', function () {
				expect(testClass.something).toEqual(jasmine.any(Number));
				expect(testClass.other).toEqual(jasmine.any(Object));
				expect(testClass.other.thing).toEqual(jasmine.any(String));
			});
		});
	});

	describe('custom generators', function () {

		var testValue = {
			test: 'TEST_VALUE'
		};

		var Test = (function (_FluentFix$Generator$Abstract) {
			_inherits(Test, _FluentFix$Generator$Abstract);

			function Test() {
				_classCallCheck(this, Test);

				_get(Object.getPrototypeOf(Test.prototype), 'constructor', this).call(this);
			}

			_createClass(Test, [{
				key: 'generate',
				value: function generate() {
					return testValue;
				}
			}], [{
				key: 'match',
				value: function match(property) {
					return property.test && property.test === testValue.test;
				}
			}]);

			return Test;
		})(FluentFix.Generator.Abstract);

		beforeEach(function () {
			FluentFix.Generator.addGenerator(Test);

			fixture = FluentFix.fixture({
				something: {
					test: 'TEST_VALUE'
				}
			});
		});

		it('should call gen when used in fixture', function () {
			var testClass = fixture();

			expect(testClass.something.test).toEqual(testValue.test);
		});

		it('should remove gen', function () {
			FluentFix.Generator.removeGenerator(Test);

			var testClass = fixture();

			expect(testClass.something.test).toEqual(jasmine.any(String));
		});

		describe('used directly', function () {

			var directfixture = null;

			beforeEach(function () {
				directfixture = FluentFix.fixture({
					something: new Test()
				});
			});

			it('should call gen when used in fixture', function () {
				var testClass = directfixture();

				expect(testClass.something.test).toEqual(testValue.test);
			});
		});
	});
});

