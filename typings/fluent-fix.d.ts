declare module FluentFix {

    export interface IAbstract {
       /**
        * Generate a new value fro mthe generators spec.
        */
        generate(): any;

       /**
        * A static method used to check if a generator can generate a kind of value.
        *
        * @param {Object} propertyValue: A value to check if this generator will generate it.
        * @returns {Boolean} - Returns tru if the generator can generate this kind of value.
        */
        match(propertyValue: any): boolean;
    }

    export interface IForStatic {
       /**
        * 2dynamic4u
        *
        * This is a collection all of the generators that are currently loaded.
        * Can't really be expressed in typescript yet.
        */
    }

    export interface IGeneratorsStatic {
       /**
        * The abstract generator you will need to inherit 
        * to build your own generatos to match.
        */
        Abstract: IAbstract;

       /**
        * Add a new generator of your own to the collection of generators.
        *
        * @param {IAbstract} newgenerator: The number of instances to return
        */
        addGenerator(newgenerator: IAbstract): void;

	   /**
		* Remove a new generator of your own from the collection of generators.
		*
        * @param {IAbstract} newgenerator: The number of instances to return
        * @returns {Boolean} - Returns true if the generator was succeeefully removed.
        */
        removeGenerator(oldgenerator: IAbstract): boolean;

       /**
        * A internal module that contains all of the generator descriptions.
        */
        For: IForStatic;
    }

    export interface IFixture {
       /**
        * Create a new test object using the fixture.
        *
        * @returns {Object} - A new test object
        */
        (): any;

	   /**
		* Create a new builder for the test fixture.
		* Typescript is not able to define the dynamic nature
        * of this object as the builder is cretaed with a fluent
        * interface built from the object's fixture description.
        *
        * @returns {Object} - A new test object builder.
        */
        builder(): any;
    }

    export interface IFixtureStatic {
       /**
        * Create a new fixture from an object
        */
        (obj: any): IFixture
    }

    export interface IStatic {
       /**
        * The fixture builder for the library.
        */
        fixture: IFixtureStatic;

       /**
        * The generators module that contains all the complex generation logic.
        */
        Generators: IGeneratorsStatic;
    }
}

declare var FluentFix: FluentFix.IStatic;