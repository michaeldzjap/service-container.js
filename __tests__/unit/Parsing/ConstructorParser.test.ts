import ConstructorParser from '@src/Parsing/Parsers/ConstructorParser';
import ESTreeGenerator from '@src/Parsing/ESTreeGenerator';
import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import {
    ClassWithConstructorStub, ClassWithSimpleConstructorStub
} from '@helpers/Stubs/ParserStubs';
import {Interface} from '@typings/.';

/**
 * Generate the full ESTree and return the relevant parser.
 *
 * @param {mixed} target
 * @returns {ConstructorParser}
 */
const makeParser = <T extends {}>(target: T): ConstructorParser<T> => {
    const tree = ESTreeGenerator.generate(target.toString());

    return new ConstructorParser<T>(tree.body[0].body.body[0], target);
};

describe('ConstructorParser', (): void => {
    [
        {target: ClassWithConstructorStub, expected: 'ClassWithConstructorStub'},
        {target: ClassWithSimpleConstructorStub, expected: 'ClassWithSimpleConstructorStub'},
    ].forEach(<T extends {}>({target, expected}: {target: T, expected: string}): void => {
        it(`returns the name of the [${(target as any).name}] class to which the parsed constructor belongs`, (): void => {
            const parser = makeParser<T>(target);
            const result = parser.getClass();

            expect(result).toBe(expected);
        });
    });

    [
        {target: ClassWithConstructorStub, expected: true},
        {target: ClassWithSimpleConstructorStub, expected: false},
    ].forEach(<T extends {}>({target, expected}: {target: T, expected: boolean}): void => {
        it(`verifies if the constructor of the parsed [${(target as any).name}] class has parameters`, (): void => {
            const parser = makeParser<T>(target);
            const result = parser.hasParameters();

            expect(result).toBe(expected);
        });
    });

    [
        {
            target: ClassWithConstructorStub,
            expected: [
                new ParameterDescriptor({name: 'a', type: Number, position: 0}),
                new ParameterDescriptor({name: 'b', type: String, position: 1, value: 'Hey now!'}),
                new ParameterDescriptor({name: 'c', type: Array, position: 2, value: [1, 2, 3]}),
                new ParameterDescriptor({name: 'd', type: Interface, position: 3}),
            ]
        },
        {target: ClassWithSimpleConstructorStub, expected: []},
    ].forEach(<T extends {}>({target, expected}: {target: T, expected: Array<any>}): void => {
        it(`returns the parameters of the constructor belonging to the parsed [${(target as any).name}] class`, (): void => {
            const parser = makeParser<T>(target);
            const result = parser.getParameters();

            expect(result).toEqual(expected);
        });
    });
});
