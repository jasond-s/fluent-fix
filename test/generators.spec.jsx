describe('Generators for fixture values', function () {

    let fixture = null,
        testClass = null,
        testClassComplex = null,
        testClassComplex2 = null;

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

    describe('boolean generator', function () {

        describe('simple object', function () {

            beforeEach(function () {
                testClass = new FluentFix.Generator.For.Boolean({ default: true }).generate();
                testClassSimple = new FluentFix.Generator.For.Boolean().generate();
            });

            it('should return a new number as default if specified', function () {
                expect(testClass).toEqual(true);
            });

            it('should return a new random number as default', function () {
                expect(testClassSimple).toEqual(jasmine.any(Boolean));
            });
        });
    });

    describe('number generator', function () {

        describe('simple object', function () {

            beforeEach(function () {
                testClass = new FluentFix.Generator.For.Number({ default: 5 }).generate();
                testClassSimple = new FluentFix.Generator.For.Number().generate();
                testClassComplex = new FluentFix.Generator.For.Number({min: 10, max: 15, sequential: true});
            });

            it('should return a new number as default if specified', function () {
                expect(testClass).toEqual(5);
            });

            it('should return a new random number as default', function () {
                expect(testClassSimple).toEqual(jasmine.any(Number));
            });

            it('should return a new number in range if options specified', function () {
                let testClassComplexNumber = testClassComplex.generate();
                
                expect(testClassComplexNumber).toEqual(jasmine.any(Number));
                expect(testClassComplexNumber).toBeLessThan(16);
                expect(testClassComplexNumber).toBeGreaterThan(9);
            });
            
            it('should return a new number in sequence if options specified', function () {
                let testItem = null,
                    testNumber = 0;

                for (var i = 0; i < 10; i++) {

                    testNumber = testItem ? testItem : 0;
                    testItem = testClassComplex.generate();

                    expect(testItem).toEqual(jasmine.any(Number));
                    expect(testItem).toBeGreaterThan(testNumber);
                }
            });
        });
    });

    describe('date generator', function () {

        describe('simple object', function () {

            let testDate = new Date(),
                testDate1 = new Date(1990, 1, 1),
                testDate2 = new Date(1990, 1, 20);

            beforeEach(function () {
                testClass = new FluentFix.Generator.For.Date(testDate).generate();

                testClassComplex = new FluentFix.Generator.For.Date({min: testDate1, max: testDate2});

                let one_second = 1000;
                let one_minute = 60 * one_second;

                testClassComplex2 = new FluentFix.Generator.For.Date({min: one_second, max: one_minute, sequential: true});
            });

            it('should return a new date as default if specified', function () {
                expect(testClass).toEqual(jasmine.any(Date));
                expect(testClass).not.toBe(testDate);
                expect(testClass.getTime()).toEqual(testDate.getTime());
            });
            
            it('should return a new date in range if options specified', function () {
                for (var i = 0; i < 10; i++) {

                    let testItem = testClassComplex.generate();

                    expect(testItem).toEqual(jasmine.any(Date));
                    expect(testItem.getTime()).toBeLessThan(testDate2.getTime());
                    expect(testItem.getTime()).toBeGreaterThan(testDate1.getTime());
                }
            });
            
            it('should return a new date in sequence if options specified', function () {
                let testItem = null,
                    testTicks = 0;

                for (var i = 0; i < 10; i++) {

                    testTicks = testItem ? testItem.getTime() : 0;
                    testItem = testClassComplex2.generate();

                    expect(testItem).toEqual(jasmine.any(Date));
                    expect(testItem.getTime()).toBeGreaterThan(testTicks);
                }
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
            constructor () { 
                super();

                this.name = "TEST_GENERATOR";
            }            
            
            generate () {
                return "SOME_RANDOM_VALUE";
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

            expect(testClass.something).toEqual("SOME_RANDOM_VALUE");
        });

        it('should remove gen', function () {
            FluentFix.Generator.removeGenerator(Test);

            // The fixture caches all the generators in the structure of the fixture.
            // So. We need to regenerate the fixture after editing the globals.
            fixture = FluentFix.fixture({
                something: {
                    test: 'TEST_VALUE'
                }
            });

            let testClass = fixture();

            expect(testClass.something).toEqual({ test: jasmine.any(String) });
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

                expect(testClass.something).toEqual("SOME_RANDOM_VALUE");
            });
        });
    });
});