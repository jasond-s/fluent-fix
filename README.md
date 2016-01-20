# fluent-fix

A javascript library for creating test fixtures fluently for use in testing. 

The library is aiming to be as *fluent* and as *extensible* as possible, while remaining as *simple* as calling a function to get started.


## Installation

Install the library as a development dependancy.

`npm install --save-dev fluent-fix`


## Usage

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

// USe the fixture to create instances of the object with random data.
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
// Some complicated thing
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

// You can even build fixtures with other fixtures.
// You can use functions to setup values before calling build.

let complexFixture = fixture
    .builder()
    .withThing(function () { return fixture(); })
    .build();

// The evaluation of the final object unlike a lot of libraries is also lazy.
// Nothing is evaluated until you call build!
```

Currently the fluent api does not extend to deep levels of given objects. Current usage encourages you to build up the fixtures from small objects to create larger pieces of test data. If there is a wider need for the library to support a deeper interogation of the test fixtures, then we will add this in the future.

The library also does not currently support functions directly, unless returned as a `.withXXXX(function () { return function () { return 'test value' }})`... but a better approach is coming soon. 


## Extensions

We hope to make sure the library is as extensible as possible and has appropriate extension points.