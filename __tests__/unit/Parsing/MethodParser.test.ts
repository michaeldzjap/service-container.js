import ESTreeGenerator from '@src/Parsing/ESTreeGenerator';
import MethodParser from '@src/Parsing/Parsers/MethodParser';
import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import {ClassWithPublicMethodStub, ClassWithPublicStaticMethodStub} from '@helpers/Stubs/ParserStubs';
import {Interface} from '@typings/.';

describe('MethodParser', (): void => {
    const EXPECTED = [
        new ParameterDescriptor({name: 'a', type: Number, position: 0}),
        new ParameterDescriptor({name: 'b', type: String, position: 1, value: 'Hey now!'}),
        new ParameterDescriptor({name: 'c', type: Array, position: 2, value: [1, 2, 3]}),
        new ParameterDescriptor({name: 'd', type: Interface, position: 3}),
    ];

    it('returns the parameters of the method belonging to the parsed class', (): void => {
        const tree = ESTreeGenerator.generate(ClassWithPublicMethodStub.toString());
        const parser = new MethodParser(
            tree.body[0].body.body[0],
            ClassWithPublicMethodStub.prototype,
            'someMethod'
        );
        const result = parser.getParameters();

        expect(result).toEqual(EXPECTED);
    });

    it('returns the parameters of the static method belonging to the parsed class', (): void => {
        const tree = ESTreeGenerator.generate(ClassWithPublicStaticMethodStub.toString());
        const parser = new MethodParser(
            tree.body[0].body.body[0],
            ClassWithPublicStaticMethodStub,
            'someMethod'
        );
        const result = parser.getParameters();

        expect(result).toEqual(EXPECTED);
    });
});
