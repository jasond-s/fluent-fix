describe('Generators for fixture values', function () {

	var fixture = null;
	var testClass = null;

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