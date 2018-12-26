import ExpressionCollector from '@src/Parsing/Analysers/ExpressionCollector';
import * as ExpressionCollectorStub from '@helpers/Stubs/esnext/ExpressionCollectorStub.json';

describe('ExpressionCollector', (): void => {
    [
        {label: 'simple', expected: [1, 2, 3]},
        {label: 'nested', expected: [[[1]], [[1, 2]], [[1, 2, 3]]]},
        {label: 'mixed simple', expected: [1, '2', {a: 1, b: 2, c: 3}]},
        {label: 'mixed nested', expected: [[[1, '2', {a: 1, b: 2, c: 3}]]]},
    ].forEach(({label, expected}, i: number): void => {
        it(`collects all the elements in a [${label}] array expression`, (): void => {
            const result = ExpressionCollector.collectElements(
                ExpressionCollectorStub.body[0].body.body[i].value.params[0].right,
            );

            expect(result).toEqual(expected);
        });
    });

    it('fails to collect an newable element in an array expression', (): void => {
        // eslint-disable-next-line require-jsdoc
        const fn = (): unknown[] => ExpressionCollector.collectElements(
            ExpressionCollectorStub.body[0].body.body[4].value.params[0].right
        );

        expect(fn).toThrow('AST expression cannot be resolved.');
    });

    [
        {label: 'simple', expected: {a: 1, b: 2, c: 3}},
        {label: 'nested', expected: {a: {b: {c: 1}}, d: {e: [1, 2, 3]}, f: [[1, 2, 3]]}},
    ].forEach(({label, expected}, i: number): void => {
        it(`collects all the properties of a [${label}] object expression`, (): void => {
            const result = ExpressionCollector.collectProperties(
                ExpressionCollectorStub.body[0].body.body[5 + i].value.params[0].right
            );

            expect(result).toEqual(expected);
        });
    });

    it('fails to collect an newable property of an object expression', (): void => {
        // eslint-disable-next-line require-jsdoc
        const fn = (): object => ExpressionCollector.collectProperties(
            ExpressionCollectorStub.body[0].body.body[7].value.params[0].right
        );

        expect(fn).toThrow('AST expression cannot be resolved.');
    });
});
