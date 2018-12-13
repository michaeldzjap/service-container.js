import ESTreeGenerator from '@src/Parsing/ESTreeGenerator';
import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import ParameterParser from '@src/Parsing/Parsers/ParameterParser';
import {
    ClassWithConstructorStub, ClassWithSimpleConstructorStub
} from '@helpers/Stubs/ParserStubs';
import {Interface} from '@typings/.';

/**
 * Generate the full ESTree and return the relevant parser.
 *
 * @param {mixed} target
 * @returns {ParameterParser}
 */
const makeParser = (target: any): ParameterParser<unknown> => {
    const tree = ESTreeGenerator.generate(target.toString());

    return new ParameterParser(
        tree.body[0].body.body[0].value.params,
        {target}
    );
};

describe('ParameterParser', (): void => {
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
    ].forEach(({target, expected}): void => {
        it(`returns the parameters of the constructor belonging to the parsed [${target.name}] class`, (): void => {
            const parser = makeParser(target);
            const result = parser.all();

            expect(result).toEqual(expected);
        });
    });

    it('returns the parameter at a specific index of the constructor belonging to the parsed class', (): void => {
        const parser = makeParser(ClassWithConstructorStub);
        const result = parser.at(2);

        expect(result).toEqual(
            new ParameterDescriptor({name: 'c', type: Array, position: 2, value: [1, 2, 3]})
        );
    });
});
