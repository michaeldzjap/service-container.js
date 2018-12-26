import ES5ClassAnalyser from '@src/Parsing/Analysers/es5/ClassAnalyser';
import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';
import {
    ClassWithConstructorStub,
    ClassWithoutConstructorStub,
    ClassWithoutBodyStub,
    ClassWithPublicMethodStub,
    ClassWithPublicStaticMethodStub
} from '@helpers/Stubs/ParserStubs';
import {defineMetadata} from '@helpers/defineMetadata';
import {Interface} from '@src/Support/types';
import * as ES5ClassWithConstructorStub from '@helpers/Stubs/es5/ClassWithConstructorStub.json';
import * as ES5ClassWithoutConstructorStub from '@helpers/Stubs/es5/ClassWithoutConstructorStub.json';
import * as ES5ClassWithoutBodyStub from '@helpers/Stubs/es5/ClassWithoutBodyStub.json';
import * as ES5ClassWithPublicMethodStub from '@helpers/Stubs/es5/ClassWithPublicMethodStub.json';
import * as ES5ClassWithPublicStaticMethodStub from '@helpers/Stubs/es5/ClassWithPublicStaticMethodStub.json';

const EXPECTED = [
    new ParameterDescriptor({name: 'a', type: Number, position: 0}),
    new ParameterDescriptor({name: 'b', type: String, position: 1, value: 'Hey now!'}),
    new ParameterDescriptor({name: 'c', type: Array, position: 2, value: [1, 2, 3]}),
    new ParameterDescriptor({name: 'd', type: Interface, position: 3}),
];

// Ensure that the type metadata exists for the given targets
defineMetadata([
    {target: ClassWithConstructorStub},
    {target: ClassWithPublicMethodStub.prototype, propertyKey: 'someMethod'},
    {target: ClassWithPublicStaticMethodStub, propertyKey: 'someMethod'},
], EXPECTED);

describe('ClassAnalyser', (): void => {
    [
        {ast: ES5ClassWithConstructorStub.body[0], target: ClassWithConstructorStub, expected: true},
        {ast: ES5ClassWithoutConstructorStub.body[0], target: ClassWithoutConstructorStub, expected: false},
        {ast: ES5ClassWithoutBodyStub.body[0], target: ClassWithoutBodyStub, expected: false},
    ].forEach(({ast, target, expected}): void => {
        it(`verifies that the parsed class does${expected ? '' : ' not'} have a constructor`, (): void => {
            const analyser = new ES5ClassAnalyser(ast, target);
            const result = analyser.hasConstructor();

            expect(result).toBe(expected);
        });
    });

    [
        {ast: ES5ClassWithConstructorStub.body[0], target: ClassWithConstructorStub, expected: EXPECTED},
        {ast: ES5ClassWithoutConstructorStub.body[0], target: ClassWithoutConstructorStub},
        {ast: ES5ClassWithoutBodyStub.body[0], target: ClassWithoutBodyStub},
    ].forEach(({ast, target, expected}): void => {
        it(`returns the constructor parameters of the parsed [${target.name}] class`, (): void => {
            const analyser = new ES5ClassAnalyser(ast, target);
            const result = analyser.getConstructorParameters();

            expect(result).toEqual(expected);
        });
    });

    it('returns the method parameters of the parsed [ClassWithPublicMethodStub] class', (): void => {
        const analyser = new ES5ClassAnalyser(
            ES5ClassWithPublicMethodStub.body[0],
            ClassWithPublicMethodStub.prototype
        );
        const result = analyser.getMethodParameters('someMethod');

        expect(result).toEqual(EXPECTED);
    });

    it('returns the method parameters of the parsed [ClassWithPublicStaticMethodStub] class', (): void => {
        const analyser = new ES5ClassAnalyser(
            ES5ClassWithPublicStaticMethodStub.body[0],
            ClassWithPublicStaticMethodStub
        );
        const result = analyser.getMethodParameters('someMethod');

        expect(result).toEqual(EXPECTED);
    });
});
