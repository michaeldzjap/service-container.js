import ClassParser from '@src/Parsing/Parsers/ClassParser';
import ESTreeGenerator from '@src/Parsing/ESTreeGenerator';
import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import {
    ClassWithConstructorStub, ClassWithoutConstructorStub, ClassWithoutBodyStub
} from '@helpers/Stubs/ParserStubs';
import {Interface} from '@typings/.';

/**
 * Generate the full ESTree and return the relevant parser.
 *
 * @param {mixed} target
 * @returns {ClassParser}
 */
const makeParser = <T extends {}>(target: T): ClassParser<T> => {
    const tree = ESTreeGenerator.generate(target.toString());

    return new ClassParser<T>(tree.body[0], target);
};

describe('ClassParser', (): void => {
    [
        {target: ClassWithConstructorStub, expected: true},
        {target: ClassWithoutConstructorStub, expected: false},
        {target: ClassWithoutBodyStub, expected: false},
    ].forEach(<T extends {}>({target, expected}: {target: T, expected: boolean}): void => {
        it(`verifies that the parsed class does${expected ? '' : ' not'} have a constructor`, (): void => {
            const parser = makeParser<T>(target);
            const result = parser.hasConstructor();

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
            ],
        },
        {target: ClassWithoutConstructorStub},
        {target: ClassWithoutBodyStub},
    ].forEach(({target, expected}): void => {
        it(`returns the constructor parameters of the parsed [${(target as any).name}] class`, (): void => {
            const parser = makeParser(target);
            const result = parser.getConstructorParameters();

            expect(result).toEqual(expected);
        });
    });
});
