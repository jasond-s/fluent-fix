
(function (fluentFix, globals) {

	let crypto = window.crypto;

	/* Utilities
	************************************************************/	

  function rngCrypto() {
      return crypto.getRandomValues(new Uint8Array(1))[0];
  }

  function rngTime(i) {
      return Math.random() * 0x100000000 >>> ((i & 0x03) << 3) & 0xff;
  }

  let cryptoNumber = crypto && crypto.getRandomValues && Uint8Array ? rngCrypto : rngTime;

	function cryptoString (length) {
    let text = [],
    		possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    		len = length || 15;

    for (let i = 0; i < len; i++)
      text.push(possible.charAt(Math.floor(cryptoNumber() % possible.length)));

    return text.join('');
	}

	function isArray(arr) {
	  return Object.prototype.toString.call(arr) === '[object Array]';
	}

	function isDate(date) {
		return Object.prototype.toString.call(date) === '[object Date]'
	}

	function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function objectIterate (obj, fn) {
		let newobj = {};

		for (let prop in obj)
			if (obj.hasOwnProperty(prop)) 
				fn(prop, obj, newobj);

		return newobj;
	}

	function objectMap (obj, fn, namer) {
		return objectIterate(obj, function (prop, oldObj, newObj) {
			newObj[namer ? namer(prop) : prop] = fn(oldObj[prop], prop);
		});
	}

	function clone (obj) {
		let copy;

    if (obj == null || typeof obj !== 'object')
    	return obj;

    if (isDate(obj))
      return new Date(obj.getTime());

    if (isArray(obj))
      return obj.map(function (elem) { return clone(obj[i]); });

		return objectIterate(obj, function (prop, oldObj, newObj) {
			newObj[prop] = clone(obj[prop]);
		});
	}

	/* Type coersion and generators
	************************************************************/

	function array (arr) {

		if (arr.length < 1)
			return function () { return [] };

		let typeCache = arr.map(function (elem) {
			return coerse(elem);
		});

		return function () {

			return typeCache.map(function (elem) {
				return elem();
			});
		}
	}

	function number (number) {

		return function () {
			return cryptoNumber();
		}
	}

	function string (string) {

		let length = string.length;

		return function () {
			return cryptoString(length)
		}
	}

	function coerse(something) {

		if (typeof something === 'string')
			return string(something);

		if (typeof something === 'number')
			return number(something);

		if (isDate(something))
			return new Date(something);

		if (isArray(something))
			return array(something);

		return fixture(something);
	}


	/* Build the fixtures
	************************************************************/
	function applyTransforms (transforms, testObject) {

		return objectMap(testObject, function (prop, name) {

			let transform = transforms[name];

			if (transform)
				return typeof transform === 'function' ? transform() : transform
			else
				return testObject[name];			
		});
	}

	function builder (builderFunc, fix) {

		return function () {

			let fixCopy = clone(fix),
					testObject = builderFunc(),
					transforms = {};

			let completeBuilder = objectMap(fixCopy, 
					function (prop, name) { 
						return function (fn) {

							transforms[name] = fn;

							return completeBuilder;
						};
					}, 
					function (name) {
						return 'with' + capitalizeFirstLetter(name);
					});

			completeBuilder.build = function () {
				return applyTransforms(transforms, testObject);
			}

			completeBuilder.persist = function () {
				persistance(testObject);

				return completeBuilder;
			}

			return completeBuilder;
		}
	}

	function build (fix) {

		let builderFunc = function () {
			return objectMap(fix, function (prop) { return prop(); });
		}

		builderFunc.builder = builder(builderFunc, fix);

		return builderFunc
	}

	function fixture(obj) {		
		return build(objectMap(obj, function (prop) { return coerse(prop); }));
	}

	fluentFix.fixture = fixture;

	/* Assign to globals 
	************************************************************/

	globals.FluentFix = fluentFix;

} (window.FluentFix || {}, window));