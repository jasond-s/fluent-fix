
(function (fluentFix, globals) {

	if (!fluentFix.Generator) throw new Error('Default generators not loaded.');

    let generators = fluentFix.Generator;


    /* Utilities
    ************************************************************/

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    /* Build the fixtures
    ************************************************************/

    function applyTransforms (transforms, testObject) {

        return fluentFix.objectMap(testObject, function (prop, name) {

            let transform = transforms[name];

            if (transform)
                return fluentFix.isFunction(transform) ? transform() : transform
            else
                return testObject[name];            
        });
    }

    function builder (builderFunc, fix) {

        return function () {

            let fixCopy = fluentFix.clone(fix.generate()),
                transforms = {};

            let completeBuilder = fluentFix.objectMap(fixCopy, 
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
            return fix.generate();
        }

        builderFunc.builder = builder(builderFunc, fix);

        return builderFunc
    }

    function fixture(obj) {        
        return build(new generators.Object(obj));
    }

    fluentFix.fixture = fixture;


    /* Assign to globals 
    ************************************************************/

    globals.FluentFix = fluentFix;

} (window.FluentFix || {}, window));