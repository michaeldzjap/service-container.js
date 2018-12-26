import ESNextClassAnalyser from '@src/Parsing/Analysers/esnext/ClassAnalyser';
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
import * as ESNextClassWithConstructorStub from '@helpers/Stubs/esnext/ClassWithConstructorStub.json';
import * as ESNextClassWithoutConstructorStub from '@helpers/Stubs/esnext/ClassWithoutConstructorStub.json';
import * as ESNextClassWithoutBodyStub from '@helpers/Stubs/esnext/ClassWithoutBodyStub.json';
import * as ESNextClassWithPublicMethodStub from '@helpers/Stubs/esnext/ClassWithPublicMethodStub.json';
import * as ESNextClassWithPublicStaticMethodStub from '@helpers/Stubs/esnext/ClassWithPublicStaticMethodStub.json';

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
        {ast: ESNextClassWithConstructorStub.body[0], target: ClassWithConstructorStub, expected: true},
        {ast: ESNextClassWithoutConstructorStub.body[0], target: ClassWithoutConstructorStub, expected: false},
        {ast: ESNextClassWithoutBodyStub.body[0], target: ClassWithoutBodyStub, expected: false},
    ].forEach(({ast, expected}): void => {
        it(`verifies that the parsed class does${expected ? '' : ' not'} have a constructor`, (): void => {
            const analyser = new ESNextClassAnalyser(ast);
            const result = analyser.hasConstructor();

            expect(result).toBe(expected);
        });
    });

    [
        {ast: ESNextClassWithConstructorStub.body[0], target: ClassWithConstructorStub, expected: EXPECTED},
        {ast: ESNextClassWithoutConstructorStub.body[0], target: ClassWithoutConstructorStub},
        {ast: ESNextClassWithoutBodyStub.body[0], target: ClassWithoutBodyStub},
    ].forEach(({ast, target, expected}): void => {
        it(`returns the constructor parameters of the parsed [${target.name}] class`, (): void => {
            const analyser = new ESNextClassAnalyser(ast);
            const result = analyser.getConstructorParameters(target);

            expect(result).toEqual(expected);
        });
    });

    it('returns the method parameters of the parsed [ClassWithPublicMethodStub] class', (): void => {
        const analyser = new ESNextClassAnalyser(
            ESNextClassWithPublicMethodStub.body[0]
        );
        const result = analyser.getMethodParameters(
            ClassWithPublicMethodStub.prototype, 'someMethod'
        );

        expect(result).toEqual(EXPECTED);
    });

    it('returns the method parameters of the parsed [ClassWithPublicStaticMethodStub] class', (): void => {
        const analyser = new ESNextClassAnalyser(
            ESNextClassWithPublicStaticMethodStub.body[0]
        );
        const result = analyser.getMethodParameters(
            ClassWithPublicStaticMethodStub, 'someMethod'
        );

        expect(result).toEqual(EXPECTED);
    });
});
