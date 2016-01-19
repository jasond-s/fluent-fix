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

(function (fluentFix, globals) {

	var crypto = window.crypto;

	/* Utilities
 ************************************************************/

	function rngCrypto() {
		return crypto.getRandomValues(new Uint8Array(1))[0];
	}

	function rngTime(i) {
		return Math.random() * 0x100000000 >>> ((i & 0x03) << 3) & 0xff;
	}

	var cryptoNumber = crypto && crypto.getRandomValues && Uint8Array ? rngCrypto : rngTime;

	function cryptoString(length) {
		var text = [],
		    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
		    len = length || 15;

		for (var _i = 0; _i < len; _i++) {
			text.push(possible.charAt(Math.floor(cryptoNumber() % possible.length)));
		}return text.join('');
	}

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

	/* Type coersion and generators
 ************************************************************/

	function array(arr) {

		if (arr.length < 1) return function () {
			return [];
		};

		var typeCache = arr.map(function (elem) {
			return coerse(elem);
		});

		return function () {

			return typeCache.map(function (elem) {
				return elem();
			});
		};
	}

	function number(number) {

		return function () {
			return cryptoNumber();
		};
	}

	function string(string) {

		var length = string.length;

		return function () {
			return cryptoString(length);
		};
	}

	function coerse(something) {

		if (typeof something === 'string') return string(something);

		if (typeof something === 'number') return number(something);

		if (isDate(something)) return new Date(something);

		if (isArray(something)) return array(something);

		return fixture(something);
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
			    testObject = builderFunc(),
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
				return applyTransforms(transforms, testObject);
			};

			completeBuilder.persist = function () {
				persistance(testObject);

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
			return coerse(prop);
		}));
	}

	fluentFix.fixture = fixture;

	/* Assign to globals 
 ************************************************************/

	globals.FluentFix = fluentFix;
})(window.FluentFix || {}, window);

