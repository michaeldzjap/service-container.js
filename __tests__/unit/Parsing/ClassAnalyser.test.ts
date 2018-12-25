import ClassAnalyserManager from '@src/Parsing/Analysers/ClassAnalyserManager';
import IClassAnalyser from '@src/Contracts/Parsing/IClassAnalyser';
import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';
import ParserManager from '@src/Parsing/ParserManager';
import {
    ClassWithConstructorStub,
    ClassWithoutConstructorStub,
    ClassWithoutBodyStub,
    ClassWithPublicMethodStub,
    ClassWithPublicStaticMethodStub
} from '@helpers/Stubs/ParserStubs';
import {Interface} from '@src/Support/types';

/**
 * Generate the full ESTree-compatible AST and return the relevant parser.
 *
 * @param {*} target
 * @returns {IClassAnalyser}
 */
const makeAnalyser = (ast: any, target: any): IClassAnalyser => {
    const manager = new ClassAnalyserManager(ast.body[0], target);

    return manager.driver();
};

const EXPECTED = [
    new ParameterDescriptor({name: 'a', type: Number, position: 0}),
    new ParameterDescriptor({name: 'b', type: String, position: 1, value: 'Hey now!'}),
    new ParameterDescriptor({name: 'c', type: Array, position: 2, value: [1, 2, 3]}),
    new ParameterDescriptor({name: 'd', type: Interface, position: 3}),
];

describe('ClassAnalyser', (): void => {
    [
        {target: ClassWithConstructorStub, expected: true},
        {target: ClassWithoutConstructorStub, expected: false},
        {target: ClassWithoutBodyStub, expected: false},
    ].forEach(({target, expected}: {target: any, expected: boolean}): void => { // eslint-disable-line
        it(`verifies that the parsed class does${expected ? '' : ' not'} have a constructor`, (): void => {
            const ast = (new ParserManager).ast(target.toString());
            const analyser = makeAnalyser(ast, target);
            const result = analyser.hasConstructor();

            expect(result).toBe(expected);
        });
    });

    [
        {
            target: ClassWithConstructorStub,
            expected: EXPECTED
        },
        {target: ClassWithoutConstructorStub},
        {target: ClassWithoutBodyStub},
    ].forEach(({target, expected}): void => {
        it(`returns the constructor parameters of the parsed [${target.name}] class`, (): void => {
            const ast = (new ParserManager).ast(target.toString());
            const analyser = makeAnalyser(ast, target);
            const result = analyser.getConstructorParameters();

            expect(result).toEqual(expected);
        });
    });

    it('returns the method parameters of the parsed [ClassWithPublicMethodStub] class', (): void => {
        const ast = (new ParserManager).ast(ClassWithPublicMethodStub.toString());
        const analyser = makeAnalyser(ast, ClassWithPublicMethodStub.prototype);
        const result = analyser.getMethodParameters('someMethod');

        expect(result).toEqual(EXPECTED);
    });

    it('returns the method parameters of the parsed [ClassWithPublicStaticMethodStub] class', (): void => {
        const ast = (new ParserManager).ast(ClassWithPublicStaticMethodStub.toString());
        const analyser = makeAnalyser(ast, ClassWithPublicStaticMethodStub);
        const result = analyser.getMethodParameters('someMethod');

        expect(result).toEqual(EXPECTED);
    });
});
