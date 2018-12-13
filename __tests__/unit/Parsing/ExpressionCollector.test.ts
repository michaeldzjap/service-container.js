import ESTreeGenerator from '@src/Parsing/ESTreeGenerator';
import ExpressionCollector from '@src/Parsing/ExpressionCollector';
import ExpressionCollectorStub from '@helpers/Stubs/ExpressionCollectorStub';

describe('ExpressionCollector', (): void => {
    const tree = ESTreeGenerator.generate(ExpressionCollectorStub.toString());

    [
        {label: 'simple', expected: [1, 2, 3]},
        {label: 'nested', expected: [[[1]], [[1, 2]], [[1, 2, 3]]]},
        {label: 'mixed simple', expected: [1, '2', {a: 1, b: 2, c: 3}]},
        {label: 'mixed nested', expected: [[[1, '2', {a: 1, b: 2, c: 3}]]]},
    ].forEach(({label, expected}, i: number): void => {
        it(`collects all the elements in a [${label}] array expression`, (): void => {
            const expr = tree.body[0].body.body[i].value.params[0].right;
            const result = ExpressionCollector.collectElements(expr);

            expect(result).toEqual(expected);
        });
    });

    it('fails to collect an newable element in an array expression', (): void => {
        const expr = tree.body[0].body.body[4].value.params[0].right;

        // eslint-disable-next-line require-jsdoc
        const fn = (): Array<unknown> => ExpressionCollector.collectElements(expr);

        expect(fn).toThrow('ESTree expression cannot be resolved.');
    });

    [
        {label: 'simple', expected: {a: 1, b: 2, c: 3}},
        {label: 'nested', expected: {a: {b: {c: 1}}, d: {e: [1, 2, 3]}, f: [[1, 2, 3]]}},
    ].forEach(({label, expected}, i: number): void => {
        it(`collects all the properties of a [${label}] object expression`, (): void => {
            const expr = tree.body[0].body.body[5 + i].value.params[0].right;
            const result = ExpressionCollector.collectProperties(expr);

            expect(result).toEqual(expected);
        });
    });

    it('fails to collect an newable property of an object expression', (): void => {
        const expr = tree.body[0].body.body[7].value.params[0].right;

        // eslint-disable-next-line require-jsdoc
        const fn = (): object => ExpressionCollector.collectProperties(expr);

        expect(fn).toThrow('ESTree expression cannot be resolved.');
    });
});
