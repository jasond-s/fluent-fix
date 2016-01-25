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
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (crypto, globals) {

    /* Regex for checking is string is UUID or empty GUID
    /*****************************************************/

    var UUID_REGEX = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}|[0]{8}-[0]{4}-[0]{4}-[0]{4}-[0]{12}/;

    globals.isUuid = function isUuid(suspectString) {
        return suspectString.match(UUID_REGEX);
    };

    /* Generate a new uuid string using browser crypto or time.
    /*****************************************************/

    function rngCrypto() {
        return crypto.getRandomValues(new Uint8Array(1))[0];
    }

    function rngTime(i) {
        return Math.random() * 0x100000000 >>> ((i || new Date().getTicks() & 0x03) << 3) & 0xff;
    }

    var rng = crypto && crypto.getRandomValues && Uint8Array ? rngCrypto : rngTime;

    globals.randomNumberGenerator = rng;

    function generateNewId() {
        var i = 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = rng(i++) % 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
    }

    /* Uuid object wrapper for validation and 'security'.
    /*****************************************************/

    var Uuid = (function () {
        _createClass(Uuid, null, [{
            key: 'EMPTY',
            get: function get() {
                return '00000000-0000-0000-0000-000000000000';
            }
        }]);

        function Uuid(seed) {
            _classCallCheck(this, Uuid);

            if (seed && !isUuid(seed)) {
                throw new Error('seed value for uuid must be valid uuid.');
            }

            this.innervalue = seed || generateNewId();
            this.innertime = new Date();
        }

        _createClass(Uuid, [{
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
})(window.crypto || window.msCrypto, window);

'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (fluentFix, globals) {

	var cryptoNumber = globals.randomNumberGenerator;
	var generator = fluentFix.Generator || {};

	/* Utilities
 ************************************************************/

	function cryptoString(length) {
		var text = [],
		    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
		    len = length || 15;

		for (var i = 0; i < len; i++) {
			text.push(possible.charAt(Math.floor(cryptoNumber() % possible.length)));
		}return text.join('');
	}

	function isArray(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	}

	function isDate(date) {
		return Object.prototype.toString.call(date) === '[object Date]';
	}

	/* Type coersion and default generators
 ************************************************************/

	function findGen(something) {
		for (var prop in generator.For) {
			if (generator.For.hasOwnProperty(prop)) if (generator.For[prop].match(something)) return generator.For[prop];
		}
	}

	function coerse(something) {
		if (something instanceof generator.Abstract) return something.generate;

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

	/* Custom generators
 ************************************************************/

	var genFor = generator.For || {};

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

	var NumberGenerator = (function (_GeneratorBase) {
		_inherits(NumberGenerator, _GeneratorBase);

		function NumberGenerator(number) {
			_classCallCheck(this, NumberGenerator);

			_get(Object.getPrototypeOf(NumberGenerator.prototype), 'constructor', this).call(this);

			this.defaultNumber = number;
		}

		_createClass(NumberGenerator, [{
			key: 'generate',
			value: function generate() {
				return typeof this.defaultNumber === 'undefined' ? cryptoNumber() : this.defaultNumber;
			}
		}], [{
			key: 'match',
			value: function match(something) {
				return typeof something === 'number';
			}
		}]);

		return NumberGenerator;
	})(GeneratorBase);

	genFor.Number = NumberGenerator;

	var StringGenerator = (function (_GeneratorBase2) {
		_inherits(StringGenerator, _GeneratorBase2);

		function StringGenerator(string) {
			_classCallCheck(this, StringGenerator);

			_get(Object.getPrototypeOf(StringGenerator.prototype), 'constructor', this).call(this);

			this.defaultString = string;
		}

		_createClass(StringGenerator, [{
			key: 'generate',
			value: function generate() {
				return cryptoString(typeof this.defaultString === 'undefined' ? cryptoNumber() : this.defaultString.length);
			}
		}], [{
			key: 'match',
			value: function match(something) {
				return typeof something === 'string';
			}
		}]);

		return StringGenerator;
	})(GeneratorBase);

	genFor.String = StringGenerator;

	var DateGenerator = (function (_GeneratorBase3) {
		_inherits(DateGenerator, _GeneratorBase3);

		function DateGenerator(date) {
			_classCallCheck(this, DateGenerator);

			_get(Object.getPrototypeOf(DateGenerator.prototype), 'constructor', this).call(this);

			this.date = date;
		}

		_createClass(DateGenerator, [{
			key: 'generate',
			value: function generate() {
				return new Date(this.date || cryptoNumber());
			}
		}], [{
			key: 'match',
			value: function match(something) {
				return isDate(something);
			}
		}]);

		return DateGenerator;
	})(GeneratorBase);

	genFor.Date = DateGenerator;

	var ArrayGenerator = (function (_GeneratorBase4) {
		_inherits(ArrayGenerator, _GeneratorBase4);

		function ArrayGenerator(arr) {
			_classCallCheck(this, ArrayGenerator);

			_get(Object.getPrototypeOf(ArrayGenerator.prototype), 'constructor', this).call(this);

			if (!arr || arr.length < 1) this['default'] = [];else this.typeCache = arr.map(function (elem) {
				return coerse(elem);
			});
		}

		_createClass(ArrayGenerator, [{
			key: 'generate',
			value: function generate() {
				return this['default'] || this.typeCache.map(function (elem) {
					return elem();
				});
			}
		}], [{
			key: 'match',
			value: function match(something) {
				return isArray(something);
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

	globals.FluentFix = fluentFix;
})(window.FluentFix || {}, window);

'use strict';

(function (fluentFix, globals) {

    if (!fluentFix.Generator) throw new Error('Default generators not loaded.');

    var cryptoNumber = globals.randomNumberGenerator;

    /* Utilities
    ************************************************************/

    function isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }

    function isDate(date) {
        return Object.prototype.toString.call(date) === '[object Date]';
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function objectIterate(obj, fn) {
        var newobj = {};

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) fn(prop, obj, newobj);
        }return newobj;
    }

    function objectMap(obj, fn, namer) {
        return objectIterate(obj, function (prop, oldObj, newObj) {
            newObj[namer ? namer(prop) : prop] = fn(oldObj[prop], prop);
        });
    }

    function clone(obj) {
        var copy = undefined;

        if (obj == null || typeof obj !== 'object') return obj;

        if (isDate(obj)) return new Date(obj.getTime());

        if (isArray(obj)) return obj.map(function (elem) {
            return clone(obj[i]);
        });

        return objectIterate(obj, function (prop, oldObj, newObj) {
            newObj[prop] = clone(obj[prop]);
        });
    }

    /* Build the fixtures
    ************************************************************/
    function applyTransforms(transforms, testObject) {

        return objectMap(testObject, function (prop, name) {

            var transform = transforms[name];

            if (transform) return typeof transform === 'function' ? transform() : transform;else return testObject[name];
        });
    }

    function builder(builderFunc, fix) {

        return function () {

            var fixCopy = clone(fix),
                transforms = {};

            var completeBuilder = objectMap(fixCopy, function (prop, name) {
                return function (fn) {

                    transforms[name] = fn;

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
            return objectMap(fix, function (prop) {
                return prop();
            });
        };

        builderFunc.builder = builder(builderFunc, fix);

        return builderFunc;
    }

    function fixture(obj) {
        return build(objectMap(obj, function (prop) {
            return fluentFix.Generator.coerse(prop) || fixture(prop);
        }));
    }

    fluentFix.fixture = fixture;

    /* Assign to globals 
    ************************************************************/

    globals.FluentFix = fluentFix;
})(window.FluentFix || {}, window);

