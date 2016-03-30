(function (globals) {

    let fluentFix = globals.FluentFix || {};

    let cryptoNumber = globals.randomNumberGeneratorInRange;


    /* Utilities
    ************************************************************/

    function cryptoString (length) {
        let text = [],
            possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            len = length || 15;

        for (let i = 0; i < len; i++)
            text.push(possible.charAt(Math.floor(cryptoNumber(0, possible.length - 1))));

        return text.join('');
    }

    fluentFix.cryptoString = cryptoString;

    function isNumber (num) {
        return Object.prototype.toString.call(num) === '[object Number]';
    }

    fluentFix.isNumber = isNumber;

    function isString (str) {
        return Object.prototype.toString.call(str) === '[object String]';
    }

    fluentFix.isString = isString;

    function isArray (arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }

    fluentFix.isArray = isArray;

    function isDate (date) {
        return Object.prototype.toString.call(date) === '[object Date]'
    }

    fluentFix.isDate = isDate;

    function isObject (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    fluentFix.isObject = isObject;  

    function isFunction (fn) {
        return Object.prototype.toString.call(fn) === '[object Function]';
    }

    fluentFix.isFunction = isFunction;   

    function objectIterate (obj, fn) {
        let newobj = {};

        for (let prop in obj)
            if (obj.hasOwnProperty(prop)) 
                fn(prop, obj, newobj);

        return newobj;
    }

    fluentFix.objectIterate = objectIterate;

    function objectMap (obj, fn, namer) {
        if (typeof obj === 'undefined' || obj == null) {
            return obj;
        }

        return objectIterate(obj, function (prop, oldObj, newObj) {
            newObj[namer ? namer(prop) : prop] = fn(oldObj[prop], prop);
        });
    }

    fluentFix.objectMap = objectMap;

    function clone (obj) {
        let copy;

        if (obj == null || typeof obj !== 'object')
            return obj;

        if (isDate(obj))
            return new Date(obj.getTime());

        if (isArray(obj))
            return obj.map(function (elem) { return clone(elem) });

        return objectIterate(obj, function (prop, oldObj, newObj) {
            newObj[prop] = clone(obj[prop]);
        });
    }

    fluentFix.clone = clone;


    /* Assign to globals 
    ************************************************************/

    globals.FluentFix = (globals.module || {}).exports = fluentFix;

}(window || global))
var window, global;