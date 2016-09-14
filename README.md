
[![fluent-fix](https://travis-ci.org/jasond-s/fluent-fix.svg "Travis Build")](https://travis-ci.org/jasond-s/fluent-fix "fluent-fix") [![npm version](https://badge.fury.io/js/fluent-fix.svg)](https://badge.fury.io/js/fluent-fix)

# fluent-fix

A javascript library for creating test fixtures fluently for use in testing. 

The library is aiming to be as *fluent* and as *extensible* as possible, while remaining as *simple* as calling a function to get started.

1. [Installation](#1-installation)
2. [Usage](#2-usage)
3. [Generators](#3-generators)
4. [Extensions](#4-extensions)


## <span id="1-installation">1. Installation</span>

Install the library as a development dependancy.

`npm install --save-dev fluent-fix`


## <span id="2-usage">2. Usage</span>

Getting up and running and building test instances is really simple.

```javascript
// Create an object that describes the defaults for the test data.
let someObject = { 
    something: 5,
    thing: "Hello World",
    stuff: [ "Good Bye" ],
    noStuff: [ ]
};

// The global FluentFix module is used to create fixtures.
let fixture = FluentFix.fixture(someObject);

// Use the fixture to create instances of the object with random data.
let testObject = fixture();
```

You can use the `fixture` to set-up specific values for your test object, rather than random ones, using the fluent api.

Using the code from above:

```javascript
// Create a builder instance for the fixture.
let builder = fixture.builder(); 

// Use the builder fluent api to setup a test class.
builder
    .withSomething(10)
    .withThing('Amazing Test Value');

// Now you can use this builder to create as many test objects as you like!
let fluentTestObj1 = builder.build();
let fluentTestObj2 = builder.build();
```

Any values that you haven't setup with a `.withXXXX()` method will still have been set up with the random test data as they were in the simple value.

This means that each test case should have the absolute minimum of setup code. Ace.

You can also use the fixture to setup much more complex objects than this.

```javascript
// Some complicated thing yo want to generate.
let complexObject = {
    something: 5,
    thing: {
        something: 'hello',
        thing: {
            something: 'world',
            thing: {
                something: 5
            }
        }
    }
};

let fixture = FluentFix.fixture(complexObject);

/* 
    You can even build fixtures with other fixtures.
    You can use functions to setup values before calling build.
*/

let complexFixture = fixture
    .builder()
    .withThing(function () { return fixture(); })
    .build();

/* 
    The evaluation of the final object is lazy.
    Nothing is evaluated until you call build!
*/
```

The library does not currently support functions directly, unless returned as a `.withXXXX(function () { return function () { return 'test value' }})`... but a better approach is coming soon, I hope. 


## <span id="3-generators">3. Generators</span>

Standard generators and their options values. The options are given in the code examples as the default if not specified in the options object.

If the value is undefined it is probably because that value isn't used by default and adds extra behaviour to the generator beyond just creating a random value for your tests!

### Boolean

```javascript
let booleanGenerator = new FluentFix.Generator.For.Boolean({ default: undefined });
```

Options:

1. `default: Boolean` - Specify a default boolean value for the generator.

### Number

```javascript
let numberGenerator = new FluentFix.Generator.For.Number({
        min: Number.MIN_VALUE,
        max: Number.MAX_VALUE,
        sequential: false
    });
```

Options:

1. `min: Number` - Specify a minimum for random value.
2. `max: Number` - Specify a maximum for random value.
3. `sequential: Boolean` - Specify if you would like the random generation to be sequential.

### String

```javascript
let stringGenerator = new FluentFix.Generator.For.String(value);
```

Options:

1. `value: String` - This generator needs an example string to work.

### Date

```javascript
let dateGenerator = new FluentFix.Generator.For.Date({
        min: undefined,
        max: undefined,
        sequential: false,
        seed: new Date()
    });
```

Options:

1. `min: Date` - Specify a minimum for random value.
2. `max: Date` - Specify a maximum for random value.
3. `sequential: Boolean` - Specify if you would like the random generation to be sequential.
3. `seed: Date` - Specify the start date for a sequential generator.

### Array

```javascript
let arrayGenerator = new FluentFix.Generator.For.Array({
        length: 10,
        depth: 1,
        type: 0
    });
```

Options:

1. `length: Number` - The number of items for the given depth, for instance, depth 1, legth 10 will be a simple array with length 10.
2. `depth: Number` - The depth of the array, used only if complicated matrices or multidimensional arrays are necessary.
3. `type: Object|Generator` - Specify an object to be used, will be parsed as if by the object generator, or a generator may be specified.

### Object

```javascript
let objectGenerator = new FluentFix.Generator.Object({ });
```

The object generator is used internally for the main parsing of objects and other generators. This shouldn't be needed for most use cases but is included here for completeness. All unmatched properties on test fixtures are parsed finally through the object generator. 


## <span id="4-extensionsa">4. Extensions</span>

What follows are the supported extension points for the library.

### Base Generator

```javascript
let baseGenerator = new FluentFix.Generator.Abstract(); 

// Using ES6
class YourCustomES6Generator extends FluentFix.Generator.Abstract {

    constructor () { }

    generate () {
        return 'YOUR_SPECIAL_VALUE'
    }

    static match (something) {
        return something.some_value === 'YOUR_SPECIAL_CASE';
    }
}

// Using ES5
function YourCustomES5Generator() {
    FluentFix.Generator.Abstract.call(this);
}

YourCustomES5Generator.prototype = Object.create(FluentFix.Generator.Abstract.prototype);
YourCustomES5Generator.prototype.constructor = YourCustomES5Generator;

YourCustomES5Generator.prototype.generate = function() {
    return 'YOUR_SPECIAL_VALUE'
}

YourCustomES5Generator.match = function() {
    return something.some_value === 'YOUR_SPECIAL_CASE';
}

```

The base generator that all other derive from in this `Abstract` one. You will need to implement this interface if you wish to create your own custom generators. Once you have done this you will need to add it to the current fixture context.

```javascript

// Add the generators.
FluentFix.Generator.add(YourCustomES6Generator);
FluentFix.Generator.add(YourCustomES5Generator);

// Remove the generators.
FluentFix.Generator.remove(YourCustomES6Generator);
FluentFix.Generator.remove(YourCustomES5Generator);

```

NOTE: The matching algorithm for generators moves from most primitive to least primitive internally. But has no intelligence regarding custom generators. This means that the ordering in which you add the generators is important. The **first** generator that matches the input ptoperty will be assigned for the fixture builder. I would suggest you add the 
