describe('Generators for fixture values', function () {

	let fixture = null,
		testClass = null,
		testClassComplex = null;

	describe('standard generators', function () {

		beforeEach(function () {
			fixture = FluentFix.fixture({
				something: new FluentFix.Generator.For.Number(0,100)
			});

			testClass = fixture();
		});

		it('should call gen when used in fixture', function () {
			expect(testClass.something).toEqual(jasmine.any(Number));
		});
	});

	describe('object generator', function () {

		describe('simple object', function () {

			beforeEach(function () {
				fixture = new FluentFix.Generator.Object({
					something: 5
				});

				testClass = fixture.generate();
			});

			it('should return a new object when generating', function () {
				expect(testClass.something).toEqual(jasmine.any(Number));
			});
		});

		describe('complex object', function () {

			beforeEach(function () {
				fixture = new FluentFix.Generator.Object({
					something: 5,
					other: {
						thing: 'TEST_01'
					}
				});

				testClass = fixture.generate();
			});

			it('should return a new object when generating', function () {
				expect(testClass.something).toEqual(jasmine.any(Number));
				expect(testClass.other).toEqual(jasmine.any(Object));
				expect(testClass.other.thing).toEqual(jasmine.any(String));
			});
		});
	});

	describe('number generator', function () {

		describe('simple object', function () {

			beforeEach(function () {
				testClass = new FluentFix.Generator.For.Number(5).generate();
				testClassComplex = new FluentFix.Generator.For.Number({min: 10, max: 15}).generate();
			});

			it('should return a new number as default if specified', function () {
				expect(testClass).toEqual(jasmine.any(Number));
				expect(testClass).toEqual(5);
			});

			it('should return a new number in range if options specified', function () {
				expect(testClassComplex).toEqual(jasmine.any(Number));
				expect(testClassComplex).toBeLessThan(16);
				expect(testClassComplex).toBeGreaterThan(10);
			});
		});
	});

	describe('array generator', function () {

		describe('simple object', function () {

			beforeEach(function () {
				fixture = new FluentFix.Generator.For.Array([
					5,
					'Somestring',
					{ str: 'Somestring' }
				]);

				testClass = fixture.generate();
			});

			it('should return a new array with correct types when generating', function () {
				expect(testClass[0]).toEqual(jasmine.any(Number));
				expect(testClass[1]).toEqual(jasmine.any(String));
				expect(testClass[2]).toEqual(jasmine.any(Object));
				expect(testClass[2].str).toEqual(jasmine.any(String));
			});
		});

		describe('complex object', function () {

			beforeEach(function () {
				fixture = new FluentFix.Generator.For.Array([
					5,
					'Somestring',
					{ str: 'Somestring' }
				]);

				testClass = fixture.generate();
			});

			it('should return a new object when generating', function () {
				expect(testClass[0]).toEqual(jasmine.any(Number));
				expect(testClass[1]).toEqual(jasmine.any(String));
				expect(testClass[2]).toEqual(jasmine.any(Object));
				expect(testClass[2].str).toEqual(jasmine.any(String));
			});
		});

		describe('array options', function () {

			beforeEach(function () {
				testClass = new FluentFix.Generator.For
					.Array({ length: 10, type: 'hello' })
					.generate();

				testClassComplex = new FluentFix.Generator.For
					.Array({ length: 5, depth: 2, type: { value: 'hello' }})
					.generate();
			});

			it('should return an array of length and data specified', function () {
				
				expect(testClass.length).toEqual(10);

				for (var i = 0; i < testClass.length; i++) {
					expect(testClass[i]).toEqual(jasmine.any(String));				
				};
			});

			it('should return an array of depth, length and complex data specified', function () {
		
				expect(testClassComplex.length).toEqual(5);

				for (var i = 0; i < testClassComplex.length; i++) {

					expect(testClassComplex[i]).toEqual(jasmine.any(Array));
					expect(testClassComplex[i].length).toEqual(5);

					for (var j = 0; j < testClassComplex.length; j++) {

						expect(testClassComplex[i][j]).toEqual(jasmine.any(Object));
						expect(testClassComplex[i][j].value).toEqual(jasmine.any(String));
					}				
				};
			});
		});
	});

	describe('custom generators', function () {

		var testValue = {
			test: 'TEST_VALUE'
		};

		class Test extends FluentFix.Generator.Abstract {
			constructor () { super() }
			
			generate () {
				return testValue;
			}

			static match (property) {
				return property.test && property.test === testValue.test;
			}
		}
		
		beforeEach(function () {
			FluentFix.Generator.addGenerator(Test);

			fixture = FluentFix.fixture({
				something: {
					test: 'TEST_VALUE'
				}
			});
		});

		it('should call gen when used in fixture', function () {
			let testClass = fixture();

			expect(testClass.something.test).toEqual(testValue.test);
		});

		it('should remove gen', function () {
			FluentFix.Generator.removeGenerator(Test);

			let testClass = fixture();

			expect(testClass.something.test).toEqual(jasmine.any(String));
		});

		describe('used directly', function () {

			var directfixture = null;

			beforeEach(function () {
				directfixture = FluentFix.fixture({
					something: new Test()
				});
			});

			it('should call gen when used in fixture', function () {
				let testClass = directfixture();

				expect(testClass.something.test).toEqual(testValue.test);
			});
		});
	});

});