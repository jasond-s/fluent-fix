(function (globals) {

    let fluentFix = globals.FluentFix || {};

    if (!fluentFix.Generator) throw new Error('Default generators are not loaded.');

    let generators = fluentFix.Generator;


    /* Utilities
    ************************************************************/

    function capitalizeFirstLetter (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    /* Build the fixtures
    ************************************************************/

    function applyTransforms (transforms, testObject) {

        return fluentFix.objectMap(testObject, function (prop, name) {

            let transform = transforms[name];

            if (transform) {
                
                if (transform instanceof generators.Abstract) {
                    return transform.generate();
                }

                if (fluentFix.isFunction(transform)) {
                    return transform(name);
                }

                return transform
            } else {
                return testObject[name];
            }
        });
    }

    function builder (builderFunc, fix) {

        return function () {

            let fixCopy = fluentFix.clone(fix.generate()),
                transforms = {};

            let completeBuilder = fluentFix.objectMap(fixCopy, 
                    function (prop, name) { 
                        return function (funcOrValue) {

                            transforms[name] = funcOrValue;

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
            return fix.generate();
        }

        builderFunc.builder = builder(builderFunc, fix);

        return builderFunc
    }

    function fixture (obj) {        
        return build(new generators.Object(obj));
    }

    fluentFix.fixture = fixture;


    /* Assign to globals 
    ************************************************************/

    globals.FluentFix = (globals.module || {}).exports = fluentFix;

}(window || global))
var window, global;