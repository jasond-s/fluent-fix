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
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (globals) {

    var crypto = globals.crypto || globals.msCrypto;

    /* Regex for checking is string is UUID or empty GUID
    /*****************************************************/

    var UUID_REGEX = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}|[0]{8}-[0]{4}-[0]{4}-[0]{4}-[0]{12}/;

    globals.isUuid = function isUuid(suspectString) {
        return suspectString.match(UUID_REGEX);
    };

    /* Generate a new uuid string using browser crypto or time.
    /*****************************************************/

    function rngCrypto() {
        return crypto.getRandomValues(new Uint32Array(1))[0];
    }

    function rngTime(littleBitOfExtraEntropy) {
        return Math.random() * 0x100000000 >>> ((littleBitOfExtraEntropy || new Date().getTicks() & 0x03) << 3) & 0xff;
    }

    var rng = crypto && crypto.getRandomValues && Uint8Array ? rngCrypto : rngTime;

    globals.randomNumberGenerator = rng;

    function randomNumberGeneratorInRange() {
        var min = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var max = arguments.length <= 1 || arguments[1] === undefined ? 0xFFFFFFFF : arguments[1];

        // should be number between 0 and 4,294,967,295...
        var number = rng();

        // make a percentage.
        var asPercent = 100 / 0xFFFFFFFF * number / 100;

        // redistribute the number across the new boundry
        return Math.floor(asPercent * (max - min + 1)) + min;
    }

    globals.randomNumberGeneratorInRange = randomNumberGeneratorInRange;

    function randomNumberGeneratorInSequence() {
        var minJump = arguments.length <= 0 || arguments[0] === undefined ? 0x1 : arguments[0];
        var maxJump = arguments.length <= 1 || arguments[1] === undefined ? 0x8 : arguments[1];
        var last = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

        return randomNumberGeneratorInRange(last + minJump, last + maxJump);
    }

    globals.randomNumberGeneratorInSequence = randomNumberGeneratorInSequence;

    /* Uuid object wrapper for validation and 'security'.
    /*****************************************************/

    function generateNewId() {
        var aBitOfExtraEntropy = 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
            var randomNumber = rng(aBitOfExtraEntropy++) % 16 | 0,
                choice = character == 'x' ? randomNumber : randomNumber & 0x3 | 0x8;
            return choice.toString(16);
        });
    }

    var Uuid = (function () {
        _createClass(Uuid, null, [{
            key: 'EMPTY',
            get: function get() {
                return new Uuid('00000000-0000-0000-0000-000000000000');
            }
        }]);

        function Uuid(seed) {
            _classCallCheck(this, Uuid);

            if (seed && !isUuid(seed.toString())) {
                throw new Error('seed value for uuid must be valid uuid.');
            }

            this.innervalue = (seed || generateNewId()).toString();
            this.innertime = new Date();
        }

        _createClass(Uuid, [{
            key: 'toString',
            value: function toString() {
                return this.value;
            }
        }, {
            key: 'value',
            get: function get() {
                return this.innervalue;
            }
        }, {
            key: 'time',
            get: function get() {
                return this.innertime;
            }
        }]);

        return Uuid;
    })();

    globals.Uuid = Uuid;

    globals.UuidCrypto = (globals.module || {}).exports = { Uuid: Uuid, randomNumberGenerator: rng, isUuid: isUuid };
})(window || global);
var window, global;

'use strict';

(function (globals) {

    var fluentFix = globals.FluentFix || {};

    var cryptoNumber = globals.randomNumberGeneratorInRange;

    /* Utilities
    ************************************************************/

    function cryptoString(length) {
        var text = [],
            possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            len = length || 15;

        for (var i = 0; i < len; i++) {
            text.push(possible.charAt(Math.floor(cryptoNumber(0, possible.length - 1))));
        }

        return text.join('');
    }

    fluentFix.cryptoString = cryptoString;

    function isBoolean(bool) {
        return Object.prototype.toString.call(bool) === '[object Boolean]';
    }

    fluentFix.isBoolean = isBoolean;

    function isNumber(num) {
        return Object.prototype.toString.call(num) === '[object Number]';
    }

    fluentFix.isNumber = isNumber;

    function isString(str) {
        return Object.prototype.toString.call(str) === '[object String]';
    }

    fluentFix.isString = isString;

    function isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }

    fluentFix.isArray = isArray;

    function isDate(date) {
        return Object.prototype.toString.call(date) === '[object Date]';
    }

    fluentFix.isDate = isDate;

    function isObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    fluentFix.isObject = isObject;

    function isFunction(fn) {
        return Object.prototype.toString.call(fn) === '[object Function]';
    }

    fluentFix.isFunction = isFunction;

    function objectIterate(obj, fn) {
        var newobj = {};

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                fn(prop, obj, newobj);
            }
        }

        return newobj;
    }

    fluentFix.objectIterate = objectIterate;

    function objectMap(obj, fn, namer) {
        if (typeof obj === 'undefined' || obj == null) {
            return obj;
        }

        return objectIterate(obj, function (prop, oldObj, newObj) {
            newObj[namer ? namer(prop) : prop] = fn(oldObj[prop], prop);
        });
    }

    fluentFix.objectMap = objectMap;

    function clone(obj) {
        var copy = undefined;

        if (obj == null || typeof obj !== 'object') {
            return obj;
        }

        if (isDate(obj)) {
            return new Date(obj.getTime());
        }

        if (isArray(obj)) {
            return obj.map(function (elem) {
                return clone(elem);
            });
        }

        return objectIterate(obj, function (prop, oldObj, newObj) {
            newObj[prop] = clone(obj[prop]);
        });
    }

    fluentFix.clone = clone;

    /* Assign to globals 
    ************************************************************/

    globals.FluentFix = (globals.module || {}).exports = fluentFix;
})(window || global);
var window, global;

'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (globals) {

    var fluentFix = globals.FluentFix || {};

    var cryptoNumber = globals.randomNumberGenerator;
    var cryptoNumberInRange = globals.randomNumberGeneratorInRange;
    var cryptoNumberInSequence = globals.randomNumberGeneratorInSequence;
    var generator = fluentFix.Generator || {};

    /* Type coersion and default generators
    ************************************************************/

    function findGen(something) {
        for (var prop in generator.For) {
            if (generator.For.hasOwnProperty(prop)) {
                if (generator.For[prop].match(something)) {
                    return generator.For[prop];
                }
            }
        }

        return generator.Object;
    }

    function coerse(something) {
        if (something instanceof generator.Abstract) {
            return something.generate.bind(something);
        }

        var select = findGen(something);
        if (select) {
            var gen = new select(something);
            return gen.generate.bind(gen);
        }

        return null;
    }

    generator.coerse = coerse;

    /* Abstracts and generator module
    ************************************************************/

    var GeneratorBase = (function () {
        function GeneratorBase() {
            _classCallCheck(this, GeneratorBase);
        }

        _createClass(GeneratorBase, [{
            key: 'generate',
            value: function generate() {
                throw new Error('Cannot call abstract generate function.');
            }
        }], [{
            key: 'match',
            value: function match(_) {
                throw new Error('Cannot call abstract matching function.');
            }
        }]);

        return GeneratorBase;
    })();

    generator.Abstract = GeneratorBase;

    var ObjectGenerator = (function (_GeneratorBase) {
        _inherits(ObjectGenerator, _GeneratorBase);

        function ObjectGenerator(obj) {
            _classCallCheck(this, ObjectGenerator);

            _get(Object.getPrototypeOf(ObjectGenerator.prototype), 'constructor', this).call(this);

            this.generateCache = fluentFix.objectMap(obj, function (objProp) {
                return fluentFix.Generator.coerse(objProp);
            });
        }

        _createClass(ObjectGenerator, [{
            key: 'generate',
            value: function generate() {
                return fluentFix.objectMap(this.generateCache, function (generateFunc) {
                    return generateFunc();
                });
            }
        }], [{
            key: 'match',
            value: function match(something) {
                return fluentFix.isObject(something);
            }
        }]);

        return ObjectGenerator;
    })(GeneratorBase);

    generator.Object = ObjectGenerator;

    /* Generator globals
    ************************************************************/

    var genFor = generator.For || {};

    /* Custom generators
    ************************************************************/

    function addGenerator(generator) {
        if (!(new generator() instanceof GeneratorBase)) {
            throw new Error('Generator must be of generator type.');
        }

        genFor[generator.name] = generator;
    }

    generator.addGenerator = addGenerator;

    function removeGenerator(generator) {
        if (!(new generator() instanceof GeneratorBase)) {
            throw new Error('Generator must be of generator type.');
        }

        delete genFor[generator.name];
    }

    generator.removeGenerator = removeGenerator;

    /* Default generators
    ************************************************************/

    var BooleanGenerator = (function (_GeneratorBase2) {
        _inherits(BooleanGenerator, _GeneratorBase2);

        function BooleanGenerator(bool) {
            var _this = this;

            _classCallCheck(this, BooleanGenerator);

            _get(Object.getPrototypeOf(BooleanGenerator.prototype), 'constructor', this).call(this);

            this.bool = function () {
                return cryptoNumber() % 2 == 0;
            };

            if (fluentFix.isObject(bool)) {
                (function () {
                    var defaultBoolean = bool['default'] || false;

                    _this.bool = function () {
                        return defaultBoolean;
                    };
                })();
            }
        }

        _createClass(BooleanGenerator, [{
            key: 'generate',
            value: function generate() {
                return this.bool();
            }
        }], [{
            key: 'match',
            value: function match(something) {
                return fluentFix.isBoolean(something);
            }
        }]);

        return BooleanGenerator;
    })(GeneratorBase);

    genFor.Boolean = BooleanGenerator;

    var NumberGenerator = (function (_GeneratorBase3) {
        _inherits(NumberGenerator, _GeneratorBase3);

        function NumberGenerator(number) {
            var _this2 = this;

            _classCallCheck(this, NumberGenerator);

            _get(Object.getPrototypeOf(NumberGenerator.prototype), 'constructor', this).call(this);

            var tempNumber = function tempNumber() {
                return cryptoNumber();
            };

            // assess any options.
            if (fluentFix.isObject(number)) {
                (function () {
                    var defaultNumber = number['default'] || null,
                        min = number.min || 0x0,
                        max = number.max || 0xFFFFFFFF,
                        sequential = number.sequential || false;

                    _this2.lastGeneratedNumber = 0;

                    if (sequential) {
                        tempNumber = function () {
                            return defaultNumber || cryptoNumberInSequence(min, max, _this2.lastGeneratedNumber);
                        };
                    } else {
                        tempNumber = function () {
                            return defaultNumber || cryptoNumberInRange(min, max);
                        };
                    }
                })();
            }

            this.number = tempNumber;
        }

        _createClass(NumberGenerator, [{
            key: 'generate',
            value: function generate() {
                return this.lastGeneratedNumber = this.number();
            }
        }], [{
            key: 'match',
            value: function match(something) {
                return fluentFix.isNumber(something);
            }
        }]);

        return NumberGenerator;
    })(GeneratorBase);

    genFor.Number = NumberGenerator;

    var StringGenerator = (function (_GeneratorBase4) {
        _inherits(StringGenerator, _GeneratorBase4);

        function StringGenerator(string) {
            _classCallCheck(this, StringGenerator);

            _get(Object.getPrototypeOf(StringGenerator.prototype), 'constructor', this).call(this);

            var tempString = function tempString() {
                return fluentFix.cryptoString(string.length);
            };

            if (fluentFix.isObject(string)) {
                (function () {
                    var max = string.max || 10,
                        min = string.min || 1,
                        strDefault = string['default'] || null;

                    if (strDefault === null) {
                        tempString = function () {
                            return fluentFix.cryptoString(cryptoNumberInRange(min, max));
                        };
                    } else {
                        tempString = function () {
                            return strDefault;
                        };
                    }
                })();
            }

            this.string = tempString;
        }

        _createClass(StringGenerator, [{
            key: 'generate',
            value: function generate() {
                return this.string();
            }
        }], [{
            key: 'match',
            value: function match(something) {
                return fluentFix.isString(something);
            }
        }]);

        return StringGenerator;
    })(GeneratorBase);

    genFor.String = StringGenerator;

    var DateGenerator = (function (_GeneratorBase5) {
        _inherits(DateGenerator, _GeneratorBase5);

        function DateGenerator(date) {
            var _this3 = this;

            _classCallCheck(this, DateGenerator);

            _get(Object.getPrototypeOf(DateGenerator.prototype), 'constructor', this).call(this);

            var now = new Date().getTime();

            var tempDate = function tempDate() {
                return _this3.newDateFromTicks(cryptoNumber());
            };

            if (fluentFix.isDate(date)) {
                tempDate = function () {
                    return _this3.newDateFromTicks(date.getTime());
                };
            }

            if (fluentFix.isNumber(date)) {
                tempDate = function () {
                    return _this3.newDateFromTicks(date);
                };
            }

            // assess any options.
            if (fluentFix.isObject(date)) {
                (function () {
                    var min = date.min || now,
                        max = date.max || now,
                        sequential = date.sequential || false,
                        seed = date.seed || now;

                    _this3.lastGeneratedDate = _this3.newDateFromTicks(seed);

                    var tempMin = min;
                    if (fluentFix.isDate(min)) {
                        tempMin = min.getTime();
                    }

                    var tempMax = max;
                    if (fluentFix.isDate(max)) {
                        tempMax = max.getTime();
                    }

                    if (sequential) {
                        tempDate = function () {
                            return _this3.newDateFromTicks(cryptoNumberInSequence(tempMin, tempMax, _this3.lastGeneratedDate.getTime()));
                        };
                    } else {
                        tempDate = function () {
                            return _this3.newDateFromTicks(cryptoNumberInRange(tempMin, tempMax));
                        };
                    }
                })();
            }

            this.date = tempDate;
        }

        _createClass(DateGenerator, [{
            key: 'generate',
            value: function generate() {
                return this.lastGeneratedDate = this.date();
            }
        }, {
            key: 'newDateFromTicks',

            // Private methods

            value: function newDateFromTicks(ticks) {
                var date = new Date();
                date.setTime(ticks);
                return date;
            }
        }], [{
            key: 'match',
            value: function match(something) {
                return fluentFix.isDate(something);
            }
        }]);

        return DateGenerator;
    })(GeneratorBase);

    genFor.Date = DateGenerator;

    var ArrayGenerator = (function (_GeneratorBase6) {
        _inherits(ArrayGenerator, _GeneratorBase6);

        function ArrayGenerator(arr) {
            _classCallCheck(this, ArrayGenerator);

            _get(Object.getPrototypeOf(ArrayGenerator.prototype), 'constructor', this).call(this);

            var tempType = null,
                tempArray = arr;

            // default array.
            if (!arr || arr.length < 1) {
                this.defaultArray = [];
                return;
            }

            // assess any options.
            if (fluentFix.isObject(arr)) {
                var _length = arr.length || 10,
                    depth = arr.depth || 1,
                    _type = arr.type || 0;

                tempType = _type;
                tempArray = Array.apply(null, { length: _length });

                if (depth > 1) {
                    tempType = new ArrayGenerator({ length: _length, type: _type, depth: depth - 1 });
                }
            }

            this.typeCache = tempArray.map(function (elem) {
                return coerse(elem || tempType || type);
            });
        }

        _createClass(ArrayGenerator, [{
            key: 'generate',
            value: function generate() {
                return this.defaultArray || this.typeCache.map(function (elem) {
                    return elem();
                });
            }
        }], [{
            key: 'match',
            value: function match(something) {
                return fluentFix.isArray(something);
            }
        }]);

        return ArrayGenerator;
    })(GeneratorBase);

    genFor.Array = ArrayGenerator;

    /* Assign to Generator.For
    ************************************************************/

    generator.For = genFor;

    /* Assign to Generator
    ************************************************************/

    fluentFix.Generator = generator;

    /* Assign to globals 
    ************************************************************/

    globals.FluentFix = (globals.module || {}).exports = fluentFix;
})(window || global);
var window, global;

'use strict';

(function (globals) {

    var fluentFix = globals.FluentFix || {};

    if (!fluentFix.Generator) {
        throw new Error('Default generators are not loaded.');
    }

    var generators = fluentFix.Generator;

    /* Utilities
    ************************************************************/

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /* Build the fixtures
    ************************************************************/

    function applyTransforms(transforms, testObject) {

        return fluentFix.objectMap(testObject, function (prop, name) {

            var transform = transforms[name];

            if (transform) {

                if (transform instanceof generators.Abstract) {
                    return transform.generate();
                }

                if (fluentFix.isFunction(transform)) {
                    return transform(name);
                }

                return transform;
            } else {
                return testObject[name];
            }
        });
    }

    function builder(builderFunc, fix) {

        return function () {

            var fixCopy = fluentFix.clone(fix.generate()),
                transforms = {};

            var completeBuilder = fluentFix.objectMap(fixCopy, function (prop, name) {
                return function (funcOrValue) {

                    transforms[name] = funcOrValue;

                    return completeBuilder;
                };
            }, function (name) {
                return 'with' + capitalizeFirstLetter(name);
            });

            completeBuilder.build = function () {
                return applyTransforms(transforms, builderFunc());
            };

            completeBuilder.persist = function () {

                persistance(completeBuilder.build());

                return completeBuilder;
            };

            return completeBuilder;
        };
    }

    function build(fix) {
        var builderFunc = function builderFunc() {
            return fix.generate();
        };

        builderFunc.builder = builder(builderFunc, fix);

        return builderFunc;
    }

    function fixture(obj) {
        return build(new generators.Object(obj));
    }

    fluentFix.fixture = fixture;

    /* Assign to globals 
    ************************************************************/

    globals.FluentFix = (globals.module || {}).exports = fluentFix;
})(window || global);
var window, global;

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

