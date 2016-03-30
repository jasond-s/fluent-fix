describe('Utilities and RNG', function () {

    var number;

    describe('standard rng', function () {

        beforeEach(function () {
            // Loops in tests... don't judge me.
        });

        it('should create a number', function () {
            expect(randomNumberGenerator()).toEqual(jasmine.any(Number));
        });

        it('in range should create a number', function () {
            expect(randomNumberGeneratorInRange()).toEqual(jasmine.any(Number));
        });    

        it('in range should create a number less than max and more than min', function () {
            expect(randomNumberGeneratorInRange(0, 100)).toEqual(jasmine.any(Number));
        });    

        it('in range should create a number less than max and more than min', function () {
            for (let i = 0; i < 1000; i++ ) {

                let number = randomNumberGeneratorInRange(50, 100);

                expect(number).toBeLessThan(101);
                expect(number).toBeGreaterThan(49);

                number = randomNumberGeneratorInRange(20, 25);

                expect(number).toBeLessThan(26);
                expect(number).toBeGreaterThan(19);
            }
        });    

        it('in sequence should create a number with min and max jumps', function () {
            for (let i = 0; i < 1000; i++ ) {

                let seed = 5;

                let number = randomNumberGeneratorInSequence(1, 50, seed);

                expect(number).toBeLessThan(56);
                expect(number).toBeGreaterThan(5);

                number = randomNumberGeneratorInSequence(1, 50, number);

                expect(number).toBeLessThan(106);
                expect(number).toBeGreaterThan(6);

                number = randomNumberGeneratorInSequence(1, 50, number);

                expect(number).toBeLessThan(156);
                expect(number).toBeGreaterThan(7);
            }
        });    
    });
});