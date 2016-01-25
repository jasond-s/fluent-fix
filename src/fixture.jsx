
(function (fluentFix, globals) {

	if (!fluentFix.Generator) throw new Error('Default generators not loaded.');

    let cryptoNumber = globals.randomNumberGenerator;

    /* Utilities
    ************************************************************/

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
        	return obj.map(function (elem) { return clone(obj[i]) });

        return objectIterate(obj, function (prop, oldObj, newObj) {
            newObj[prop] = clone(obj[prop]);
        });
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
                return applyTransforms(transforms, builderFunc());
            }

            completeBuilder.persist = function () {
                persistance(completeBuilder.build());

                return completeBuilder;
            }

            return completeBuilder;
        }
    }

    function build (fix) {
        let builderFunc = function () {
            return objectMap(fix, function (prop) { return prop() });
        }

        builderFunc.builder = builder(builderFunc, fix);

        return builderFunc
    }

    function fixture(obj) {        
        return build(objectMap(obj, function (prop) { 
            return fluentFix.Generator.coerse(prop) || fixture(prop)
        }));
    }

    fluentFix.fixture = fixture;

    /* Assign to globals 
    ************************************************************/

    globals.FluentFix = fluentFix;

} (window.FluentFix || {}, window));