(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
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
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
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
            noStuff: [],
            nullStuff: null,
            undefinedStuff: undefined
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

        it('will set a null value for a null property', function () {
            expect(testClass.nullStuff).toEqual(null);
        });

        it('will set an undefined value for undefined property', function () {
            expect(testClass.undefinedStuff).toEqual(undefined);
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
                        thing: { something: 5 }
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

    describe('with a function element', function () {

        var functionFixture = null,
            testClass = null,
            testName = null;

        beforeEach(function () {
            functionFixture = FluentFix.fixture({
                thing: function thing() {
                    return 5;
                }
            });

            testClass = functionFixture.builder().withThing(function (name) {
                testName = name;
                return function () {
                    return 9001;
                };
            }).build();
        });

        it('will create a real object', function () {
            expect(functionFixture()).toBeTruthy();
        });

        it('will keep sensible defaults from load', function () {
            expect(testClass.thing()).toEqual(9001);
        });

        it('will keep pass the property name to the function', function () {
            expect(testName).toEqual("thing");
        });
    });

    describe('with a function as lambda element', function () {

        var functionFixture = null,
            testClass = null;

        beforeEach(function () {
            functionFixture = FluentFix.fixture({
                thing: function thing() {
                    return 5;
                }
            });

            testClass = functionFixture.builder().withThing(function () {
                return function (retVal) {
                    return retVal;
                };
            }).build();
        });

        it('will create a real object', function () {
            expect(functionFixture()).toBeTruthy();
        });

        it('will keep sensible defaults from load', function () {
            expect(testClass.thing(9001)).toEqual(9001);
        });
    });

    describe('with a generator for the generation', function () {

        var functionFixture = null,
            testClass = null;

        beforeEach(function () {
            functionFixture = FluentFix.fixture({
                something: 5
            });

            testClass = functionFixture.builder().withSomething(new FluentFix.Generator.For.String({ "default": "SOME_TEST" })).build();
        });

        it('will create a real object', function () {
            expect(functionFixture()).toBeTruthy();
        });

        it('will keep sensible defaults from load', function () {
            expect(testClass.something).toEqual("SOME_TEST");
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

    describe('with a default object', function () {

        var date = new Date('1900/1/1');

        describe('simple', function () {
            beforeEach(function () {
                var builder = FluentFix.fixture({
                    "fluent-fix-default": true,
                    nmbr: 5,
                    str: "Hello World",
                    arr: ["Good Bye", 5, date],
                    dt: date
                });

                testClass = builder();
            });

            it('will create a new fixture for an object', function () {
                expect(testClass).toBeTruthy();
            });

            it('will set the default value for a number', function () {
                expect(testClass.nmbr).toEqual(5);
            });

            it('will set the default value for a string', function () {
                expect(testClass.str).toEqual("Hello World");
            });

            it('will set the default value for an array', function () {
                expect(testClass.arr).toEqual(["Good Bye", 5, date]);
            });

            it('will set the default value for a date', function () {
                expect(testClass.dt).toEqual(date);
            });
        });

        describe('nested', function () {
            beforeEach(function () {
                var builder = FluentFix.fixture({
                    nmbr: 5,
                    str: "Hello World",
                    arr: ["Good Bye", 5, date],
                    dt: date,
                    obj: {
                        "fluent-fix-default": true,
                        nmbr: 5,
                        str: "Hello World",
                        arr: ["Good Bye", 5, date],
                        dt: date
                    }
                });

                testClass = builder();
            });

            it('will create a new fixture for an object', function () {
                expect(testClass).toBeTruthy();
            });

            it('will not set the default value for a number', function () {
                expect(testClass.nmbr).not.toEqual(5);
            });

            it('will not set the default value for a string', function () {
                expect(testClass.str).not.toEqual("Hello World");
            });

            it('will not set the default value for an array', function () {
                expect(testClass.arr).not.toEqual(["Good Bye", 5, date]);
            });

            it('will not set the default value for a date, as a date is always set as default without generator args.', function () {
                expect(testClass.dt).toEqual(date);
            });

            it('will set the default value for a nested a number', function () {
                expect(testClass.obj.nmbr).toEqual(5);
            });

            it('will set the default value for a nested a string', function () {
                expect(testClass.obj.str).toEqual("Hello World");
            });

            it('will set the default value for a nested an array', function () {
                expect(testClass.obj.arr).toEqual(["Good Bye", 5, date]);
            });

            it('will set the default value for a nested a date', function () {
                expect(testClass.obj.dt).toEqual(date);
            });
        });
    });
});

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

describe('Generators for fixture values', function () {

    var fixture = null,
        testClass = null,
        testClassComplex = null,
        testClassComplex2 = null;

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

    describe('boolean generator', function () {

        describe('simple object', function () {

            beforeEach(function () {
                testClass = new FluentFix.Generator.For.Boolean({ 'default': true }).generate();
                testClassSimple = new FluentFix.Generator.For.Boolean().generate();
            });

            it('should return a new number as default if specified', function () {
                expect(testClass).toEqual(true);
            });

            it('should return a new random number as default', function () {
                expect(testClassSimple).toEqual(jasmine.any(Boolean));
            });
        });
    });

    describe('number generator', function () {

        describe('simple object', function () {

            beforeEach(function () {
                testClass = new FluentFix.Generator.For.Number({ 'default': 5 }).generate();
                testClassSimple = new FluentFix.Generator.For.Number().generate();
                testClassComplex = new FluentFix.Generator.For.Number({ min: 10, max: 15, sequential: true });
            });

            it('should return a new number as default if specified', function () {
                expect(testClass).toEqual(5);
            });

            it('should return a new random number as default', function () {
                expect(testClassSimple).toEqual(jasmine.any(Number));
            });

            it('should return a new number in range if options specified', function () {
                var testClassComplexNumber = testClassComplex.generate();

                expect(testClassComplexNumber).toEqual(jasmine.any(Number));
                expect(testClassComplexNumber).toBeLessThan(16);
                expect(testClassComplexNumber).toBeGreaterThan(9);
            });

            it('should return a new number in sequence if options specified', function () {
                var testItem = null,
                    testNumber = 0;

                for (var i = 0; i < 10; i++) {

                    testNumber = testItem ? testItem : 0;
                    testItem = testClassComplex.generate();

                    expect(testItem).toEqual(jasmine.any(Number));
                    expect(testItem).toBeGreaterThan(testNumber);
                }
            });
        });
    });

    describe('string generator', function () {

        describe('simple object', function () {

            beforeEach(function () {
                testClass = new FluentFix.Generator.For.String({ 'default': "SOME_TEST" }).generate();
                testClassSimple = new FluentFix.Generator.For.String("SOME_TEST").generate();
                testClassComplex = new FluentFix.Generator.For.String({ min: 10, max: 15 });
            });

            it('should return the given string as default if specified', function () {
                expect(testClass).toEqual("SOME_TEST");
            });

            it('should return a new random string of the same length as the example', function () {
                expect(testClassSimple).toEqual(jasmine.any(String));
                expect(testClassSimple.length).toEqual("SOME_TEST".length);
            });

            it('should return a new string in range if options specified', function () {
                var testClassComplexNumber = testClassComplex.generate();

                expect(testClassComplexNumber).toEqual(jasmine.any(String));
                expect(testClassComplexNumber.length).toBeLessThan(16);
                expect(testClassComplexNumber.length).toBeGreaterThan(9);
            });
        });
    });

    describe('date generator', function () {

        describe('simple object', function () {

            var testDate = new Date(),
                testDate1 = new Date(1990, 1, 1),
                testDate2 = new Date(1990, 1, 20);

            beforeEach(function () {
                testClass = new FluentFix.Generator.For.Date(testDate).generate();

                testClassComplex = new FluentFix.Generator.For.Date({ min: testDate1, max: testDate2 });

                var one_second = 1000;
                var one_minute = 60 * one_second;

                testClassComplex2 = new FluentFix.Generator.For.Date({ min: one_second, max: one_minute, sequential: true });
            });

            it('should return a new date as default if specified', function () {
                expect(testClass).toEqual(jasmine.any(Date));
                expect(testClass).not.toBe(testDate);
                expect(testClass.getTime()).toEqual(testDate.getTime());
            });

            it('should return a new date in range if options specified', function () {
                for (var i = 0; i < 10; i++) {

                    var testItem = testClassComplex.generate();

                    expect(testItem).toEqual(jasmine.any(Date));
                    expect(testItem.getTime()).toBeLessThan(testDate2.getTime());
                    expect(testItem.getTime()).toBeGreaterThan(testDate1.getTime());
                }
            });

            it('should return a new date in sequence if options specified', function () {
                var testItem = null,
                    testTicks = 0;

                for (var i = 0; i < 10; i++) {

                    testTicks = testItem ? testItem.getTime() : 0;
                    testItem = testClassComplex2.generate();

                    expect(testItem).toEqual(jasmine.any(Date));
                    expect(testItem.getTime()).toBeGreaterThan(testTicks);
                }
            });
        });
    });

    describe('array generator', function () {

        describe('simple object', function () {

            beforeEach(function () {
                fixture = new FluentFix.Generator.For.Array([5, 'Somestring', { str: 'Somestring' }]);

                testClass = fixture.generate();
            });

            it('should return a new array with correct types when generating', function () {
                expect(testClass[0]).toEqual(jasmine.any(Number));
                expect(testClass[1]).toEqual(jasmine.any(String));
                expect(testClass[2]).toEqual(jasmine.any(Object));
                expect(testClass[2].str).toEqual(jasmine.any(String));
            });
        });

        describe('complex object', function () {

            beforeEach(function () {
                fixture = new FluentFix.Generator.For.Array([5, 'Somestring', { str: 'Somestring' }]);

                testClass = fixture.generate();
            });

            it('should return a new object when generating', function () {
                expect(testClass[0]).toEqual(jasmine.any(Number));
                expect(testClass[1]).toEqual(jasmine.any(String));
                expect(testClass[2]).toEqual(jasmine.any(Object));
                expect(testClass[2].str).toEqual(jasmine.any(String));
            });
        });

        describe('array options', function () {

            beforeEach(function () {
                testClass = new FluentFix.Generator.For.Array({ length: 10, type: 'hello' }).generate();

                testClassComplex = new FluentFix.Generator.For.Array({ length: 5, depth: 2, type: { value: 'hello' } }).generate();
            });

            it('should return an array of length and data specified', function () {

                expect(testClass.length).toEqual(10);

                for (var i = 0; i < testClass.length; i++) {
                    expect(testClass[i]).toEqual(jasmine.any(String));
                };
            });

            it('should return an array of depth, length and complex data specified', function () {

                expect(testClassComplex.length).toEqual(5);

                for (var i = 0; i < testClassComplex.length; i++) {

                    expect(testClassComplex[i]).toEqual(jasmine.any(Array));
                    expect(testClassComplex[i].length).toEqual(5);

                    for (var j = 0; j < testClassComplex.length; j++) {

                        expect(testClassComplex[i][j]).toEqual(jasmine.any(Object));
                        expect(testClassComplex[i][j].value).toEqual(jasmine.any(String));
                    }
                };
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

                this.name = "TEST_GENERATOR";
            }

            _createClass(Test, [{
                key: 'generate',
                value: function generate() {
                    return "SOME_RANDOM_VALUE";
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

            expect(testClass.something).toEqual("SOME_RANDOM_VALUE");
        });

        it('should remove gen', function () {
            FluentFix.Generator.removeGenerator(Test);

            // The fixture caches all the generators in the structure of the fixture.
            // So. We need to regenerate the fixture after editing the globals.
            fixture = FluentFix.fixture({
                something: {
                    test: 'TEST_VALUE'
                }
            });

            var testClass = fixture();

            expect(testClass.something).toEqual({ test: jasmine.any(String) });
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

                expect(testClass.something).toEqual("SOME_RANDOM_VALUE");
            });
        });
    });
});

'use strict';

describe('Utilities and RNG', function () {

                var number;

                describe('standard rng', function () {

                                beforeEach(function () {
                                                // Loops in tests... don't judge me.
                                });

                                it('should create a number', function () {
                                                expect(randomNumberGenerator()).toEqual(jasmine.any(Number));
                                });

                                it('in range should create a number', function () {
                                                expect(randomNumberGeneratorInRange()).toEqual(jasmine.any(Number));
                                });

                                it('in range should create a number less than max and more than min', function () {
                                                expect(randomNumberGeneratorInRange(0, 100)).toEqual(jasmine.any(Number));
                                });

                                it('in range should create a number less than max and more than min', function () {
                                                for (var i = 0; i < 1000; i++) {

                                                                var _number = randomNumberGeneratorInRange(50, 100);

                                                                expect(_number).toBeLessThan(101);
                                                                expect(_number).toBeGreaterThan(49);

                                                                _number = randomNumberGeneratorInRange(20, 25);

                                                                expect(_number).toBeLessThan(26);
                                                                expect(_number).toBeGreaterThan(19);
                                                }
                                });

                                it('in sequence should create a number with min and max jumps', function () {
                                                for (var i = 0; i < 1000; i++) {

                                                                var seed = 5;

                                                                var _number2 = randomNumberGeneratorInSequence(1, 50, seed);

                                                                expect(_number2).toBeLessThan(56);
                                                                expect(_number2).toBeGreaterThan(5);

                                                                _number2 = randomNumberGeneratorInSequence(1, 50, _number2);

                                                                expect(_number2).toBeLessThan(106);
                                                                expect(_number2).toBeGreaterThan(6);

                                                                _number2 = randomNumberGeneratorInSequence(1, 50, _number2);

                                                                expect(_number2).toBeLessThan(156);
                                                                expect(_number2).toBeGreaterThan(7);
                                                }
                                });
                });
});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

