describe('Fixture builder', function () {
	
	var fixture = null;
	var testClass = null;
	var fluentTestClass = null;
	var complexFixture = null;

	beforeEach(function () {
		fixture = FluentFix.fixture({ 
			something: 5,
			thing: "Hello World",
			stuff: [ "Good Bye", 5 ],
			noStuff: [ ]
		});

		complexFixture = FluentFix.fixture({ 
			something: 5,
			thing: "Hello World",
			stuff: fixture()
		});

		testClass = fixture();
		complexTestClass = complexFixture();

		fluentTestClass = fixture.builder()
			.withSomething(9001)
			.withThing('TEST_01')
			.withStuff(['TEST_01'])
			.withNoStuff([ 'TEST_02' ])
			.build();
	});

	describe('with a simple object', function () {

		it('will create a new fixture for an object', function () {
			expect(testClass).toBeTruthy();
		});

		it('will set the default value for a number', function () {
			expect(testClass.something).toEqual(jasmine.any(Number));
		});

		it('will set the default value for a string', function () {
			expect(testClass.thing).toEqual(jasmine.any(String));
		});	

		it('will set the default value for an empty array', function () {
			expect(testClass.noStuff).toEqual([]);
		});

		it('will set the default value for an array', function () {
			expect(testClass.stuff).toEqual([ jasmine.any(String), jasmine.any(Number) ]);
		});

		it('will fluently create a new fixture for an object', function () {
			expect(fluentTestClass).toBeTruthy();
		});

		it('will fluently set the default value for a number', function () {
			expect(fluentTestClass.something).toBe(9001);
		});

		it('will fluently set the default value for a string', function () {
			expect(fluentTestClass.thing).toBe('TEST_01');
		});	

		it('will fluently set the default value for an empty array', function () {
			expect(fluentTestClass.noStuff).toEqual([ 'TEST_02' ]);
		});

		it('will fluently set the default value for an array', function () {
			expect(fluentTestClass.stuff).toEqual([ 'TEST_01' ]);
		});

		it('will keep sensible defaults from load', function () {
			var fluentTestClassWithDefaults = fixture
				.builder()
				.withSomething(9002)
				.build();

			expect(fluentTestClassWithDefaults.something).toBe(9002);
			expect(fluentTestClassWithDefaults.thing).toEqual(jasmine.any(String));
			expect(testClass.noStuff).toEqual([]);
			expect(testClass.stuff).toEqual([ jasmine.any(String), jasmine.any(Number) ]);
		});
	});

	describe('with a complex object', function () {

		it('will create nested objects', function () {
			expect(complexTestClass).toBeTruthy();
		});

		it('will map the nested object and defaults', function () {

			expect(complexTestClass.something).toEqual(jasmine.any(Number));

			expect(complexTestClass.stuff.thing).toEqual(jasmine.any(String));
			expect(complexTestClass.stuff.something).toEqual(jasmine.any(Number));
			expect(complexTestClass.stuff.stuff).toEqual([ jasmine.any(String), jasmine.any(Number) ]);
		});

		it('will keep sensible defaults from load', function () {
			var fluentTestClassWithDefaults = fixture
				.builder()
				.withSomething(function () { return 9002; })
				.withStuff(function () {
					return fixture
						.builder()
						.withSomething(function () { return 9002; })
						.build()
				})
				.build();

			expect(fluentTestClassWithDefaults.something).toEqual(9002);
			expect(fluentTestClassWithDefaults.thing).toEqual(jasmine.any(String));

			expect(fluentTestClassWithDefaults.stuff.something).toEqual(9002);
			expect(fluentTestClassWithDefaults.stuff.thing).toEqual(jasmine.any(String));
		});
	});

	describe('with a builder instance', function () {

		it('will keep sensible defaults from load', function () {
			var builder = fixture
				.builder()
				.withSomething(9002);

			var fluentTestClassWithDefaults1 = builder.build();
			var fluentTestClassWithDefaults2 = builder.build();

			expect(fluentTestClassWithDefaults1.something).toEqual(9002);
			expect(fluentTestClassWithDefaults1.thing).toEqual(jasmine.any(String));

			expect(fluentTestClassWithDefaults2.something).toEqual(9002);
			expect(fluentTestClassWithDefaults2.thing).toEqual(jasmine.any(String));
		});
	});

	describe('with a complex nested object', function () {

		it('will keep sensible defaults from load', function () {
			var complexFixture = FluentFix.fixture({ 
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
			});

			var complex = complexFixture();

			expect(complex.something).toEqual(jasmine.any(Number));
			expect(complex.thing.something).toEqual(jasmine.any(String));
			expect(complex.thing.thing.something).toEqual(jasmine.any(String));
			expect(complex.thing.thing.thing.something).toEqual(jasmine.any(Number));
		});
	});

	describe('with a function return in an object', function () {

		var functionFixture = null;

		beforeEach(function () {
			functionFixture = FluentFix.fixture({ 
				something: 5,
				thing: function () {
					return 5;
				}
			});
		});

		it('will create a real object', function () {
			expect(functionFixture()).toBeTruthy();
		});		

		it('will keep sensible defaults from load', function () {
			var testClass = functionFixture
				.builder()
				.withThing(function () {
					return function () {
						return 9001;
					}
				})
				.build();

			expect(testClass.thing()).toEqual(9001);
		});
	});
});