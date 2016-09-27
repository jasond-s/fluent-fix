(function (globals) {

    let fluentFix = globals.FluentFix || {};

    let cryptoNumber = globals.randomNumberGenerator;
    let cryptoNumberInRange = globals.randomNumberGeneratorInRange;
    let cryptoNumberInSequence = globals.randomNumberGeneratorInSequence;
    let generator = fluentFix.Generator || {};


    /* Type coersion and default generators
    ************************************************************/

    function findGen (something) {       
        for (let prop in generator.For) {
            if (generator.For.hasOwnProperty(prop)) {
                if (generator.For[prop].match(something)) {
                    return generator.For[prop];
                }
            }
        }

        return generator.Object;
    }

    function coerse (something) {
        if (something instanceof generator.Abstract) {
            return something.generate.bind(something);
        }

        let select = findGen(something);
        if (select) {
            let gen = new select(something);
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

    class ObjectGenerator extends GeneratorBase {

        constructor (obj) { 
            super();

            this.generateCache = fluentFix.objectMap(obj, function (objProp) { 
                return fluentFix.Generator.coerse(objProp);
            })
        }

        generate () {
            return fluentFix.objectMap(this.generateCache, function (generateFunc) { 
                return generateFunc() 
            });
        }

        static match (something) {
            return fluentFix.isObject(something);
        }
    }

    generator.Object = ObjectGenerator;


    /* Generator globals
    ************************************************************/

    let genFor = generator.For || {};


    /* Custom generators
    ************************************************************/

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

    class BooleanGenerator extends GeneratorBase {

        constructor (bool) {
            super();

            this.bool = () => cryptoNumber() % 2 == 0;

            if (fluentFix.isObject(bool)) {
                let defaultBoolean = bool.default || false;

                this.bool = () => defaultBoolean;
            }
        }

        generate () {
            return this.bool();
        }

        static match (something) {
            return fluentFix.isBoolean(something);
        }
    }    

    genFor.Boolean = BooleanGenerator;

    class NumberGenerator extends GeneratorBase {

        constructor (number) {
            super();

            let tempNumber = () => cryptoNumber();

            // assess any options.
            if (fluentFix.isObject(number)) {
                let defaultNumber = number.default || null,
                    min = number.min || 0x0,
                    max = number.max || 0xFFFFFFFF,
                    sequential = number.sequential || false;

                this.lastGeneratedNumber = 0;

                if (sequential) {
                    tempNumber = () => defaultNumber || cryptoNumberInSequence(min, max, this.lastGeneratedNumber);
                } else {
                    tempNumber = () => defaultNumber || cryptoNumberInRange(min, max);
                }
            }

            this.number = tempNumber;
        }

        generate () {
            return this.lastGeneratedNumber = this.number();
        }

        static match (something) {
            return fluentFix.isNumber(something);
        }
    }    

    genFor.Number = NumberGenerator;

    class StringGenerator extends GeneratorBase {

        constructor (string) {
            super();

            var tempString = () => fluentFix.cryptoString(string.length);

            if (fluentFix.isObject(string)) {
                let max = string.max || 10,
                    min = string.min || 1,
                    strDefault = string.default || null;

                if (strDefault === null) {
                    tempString = () => fluentFix.cryptoString(cryptoNumberInRange(min, max))
                } else {
                    tempString = () => strDefault;
                }
            }

            this.string = tempString;
        }

        generate () {
            return this.string();
        }

        static match (something) {
            return fluentFix.isString(something);
        }
    }

    genFor.String = StringGenerator;

    class DateGenerator extends GeneratorBase {

        constructor (date) {
            super();

            let now = new Date().getTime();

            let tempDate = () => this.newDateFromTicks(cryptoNumber());

            if (fluentFix.isDate(date)) {
                tempDate = () => this.newDateFromTicks(date.getTime());
            }

            if (fluentFix.isNumber(date)) {
                tempDate = () => this.newDateFromTicks(date);
            }

            // assess any options.
            if (fluentFix.isObject(date)) {
                let min = date.min || now,
                    max = date.max || now,
                    sequential = date.sequential || false,
                    seed = date.seed || now;
                    
                this.lastGeneratedDate = this.newDateFromTicks(seed);

                let tempMin = min;
                if (fluentFix.isDate(min)) {
                    tempMin = min.getTime();
                }

                let tempMax = max;
                if (fluentFix.isDate(max)) {
                    tempMax = max.getTime();
                }

                if (sequential) {
                    tempDate = () => this.newDateFromTicks(cryptoNumberInSequence(tempMin, tempMax, this.lastGeneratedDate.getTime()));
                } else {
                    tempDate = () => this.newDateFromTicks(cryptoNumberInRange(tempMin, tempMax));
                }
            }

            this.date = tempDate;
        }

        generate () {
            return this.lastGeneratedDate = this.date();
        }

        static match (something) {
            return fluentFix.isDate(something);
        }

        // Private methods

        newDateFromTicks (ticks) {
            let date = new Date();
            date.setTime(ticks);
            return date;
        }
    }

    genFor.Date = DateGenerator;

    class ArrayGenerator extends GeneratorBase {

        constructor (arr) { 
            super(); 

            let tempType = null,
                tempArray = arr;

            // default array.
            if (!arr || arr.length < 1) {
                this.defaultArray = [];
                return;
            }

            // assess any options.
            if (fluentFix.isObject(arr)) {
                let length = arr.length || 10,
                    depth = arr.depth || 1,
                    type = arr.type || 0;

                tempType = type;
                tempArray = Array.apply(null, {length: length});

                if (depth > 1) {
                    tempType = new ArrayGenerator({length: length, type: type, depth: depth - 1});
                }
            }

            this.typeCache = tempArray.map((elem) => coerse(elem || tempType || type));
        }

        generate () {  
            return this.defaultArray || this.typeCache.map(function (elem) {
                return elem();
            });
        }

        static match (something) {
            return fluentFix.isArray(something);
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

    globals.FluentFix = (globals.module || {}).exports = fluentFix;

}(window || global))
var window, global;