(function (fluentFix, globals) {

    let cryptoNumber = globals.randomNumberGenerator;
	let generator = fluentFix.Generator || {};


    /* Utilities
    ************************************************************/

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


    /* Type coersion and default generators
    ************************************************************/

    function findGen(something) {   	
        for (let prop in generator.For)
            if (generator.For.hasOwnProperty(prop))
            	if (generator.For[prop].match(something))
            		return generator.For[prop];
    }

    function coerse(something) {
    	if (something instanceof generator.Abstract)
    		return something.generate;

    	let select = findGen(something);
        if (select) {        		    	
        	var gen = new select(something);
            return gen.generate.bind(gen);
        }

        return null;
    }

	generator.coerse = coerse;


    /* Abstracts and generator module
    ************************************************************/

	class GeneratorBase {
		constructor () { }

		generate() { throw new Error('Cannot call abstract generate function.') }
		static match(_) { throw new Error('Cannot call abstract matching function.') }
	}

	generator.Abstract = GeneratorBase;


    /* Custom generators
    ************************************************************/

	let genFor = generator.For || {};


	function addGenerator (generator) {
		if (!(new generator() instanceof GeneratorBase)) {
			throw new Error('Generator must be of generator type.');
		}

		genFor[generator.name] = generator;
	}

	generator.addGenerator = addGenerator;

	function removeGenerator (generator) {
		if (!(new generator() instanceof GeneratorBase)) {
			throw new Error('Generator must be of generator type.');
		}

		delete genFor[generator.name];
	}

	generator.removeGenerator = removeGenerator;


    /* Default generators
    ************************************************************/

	class NumberGenerator extends GeneratorBase {

		constructor(number) {
			super();

			this.defaultNumber = number;
		}

		generate() {
			return typeof this.defaultNumber === 'undefined' 
				? cryptoNumber() 
				: this.defaultNumber;
		}

		static match(something) {
			return typeof something === 'number';
		}
	}	

	genFor.Number = NumberGenerator;

	class StringGenerator extends GeneratorBase {

		constructor (string) {
			super();

			this.defaultString = string;
		}

		generate() {
			return cryptoString(typeof this.defaultString === 'undefined' 
				? cryptoNumber() 
				: this.defaultString.length);
		}

		static match(something) {
			return typeof something === 'string';
		}
	}

	genFor.String = StringGenerator;

	class DateGenerator extends GeneratorBase {

		constructor (date) {
			super();

			this.date = date;			
		}

		generate() {
			return new Date(this.date || cryptoNumber());
		}

		static match(something) {
			return isDate(something);
		}
	}

	genFor.Date = DateGenerator;

	class ArrayGenerator extends GeneratorBase {

		constructor (arr) { 
			super();    

			if (!arr || arr.length < 1)
	            this.default = [];
	        else 
		        this.typeCache = arr.map(function (elem) {
		            return coerse(elem);
		        });			
		}

		generate() {  
	        return this.default || this.typeCache.map(function (elem) {
                return elem();
            });
		}

		static match(something) {
			return isArray(something);
		}
	}

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

}(window.FluentFix || {}, window))