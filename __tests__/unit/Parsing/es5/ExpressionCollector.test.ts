import ExpressionCollector from '@src/Parsing/Analysers/ExpressionCollector';
import * as simpleArrayExpression from '@helpers/Stubs/es5/simpleArrayExpression.json';
import * as nestedArrayExpression from '@helpers/Stubs/es5/nestedArrayExpression.json';
import * as mixedSimpleArrayExpression from '@helpers/Stubs/es5/mixedSimpleArrayExpression.json';
import * as mixedNestedArrayExpression from '@helpers/Stubs/es5/mixedNestedArrayExpression.json';
import * as failingArrayExpression from '@helpers/Stubs/es5/failingArrayExpression.json';
import * as simpleObjectExpression from '@helpers/Stubs/es5/simpleObjectExpression.json';
import * as nestedObjectExpression from '@helpers/Stubs/es5/nestedObjectExpression.json';
import * as failingObjectExpression from '@helpers/Stubs/es5/failingObjectExpression.json';

describe('ExpressionCollector', (): void => {
    [
        {ast: simpleArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right, label: 'simple', expected: [1, 2, 3]},
        {ast: nestedArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right, label: 'nested', expected: [[[1]], [[1, 2]], [[1, 2, 3]]]},
        {ast: mixedSimpleArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right, label: 'mixed simple', expected: [1, '2', {a: 1, b: 2, c: 3}]},
        {ast: mixedNestedArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right, label: 'mixed nested', expected: [[[1, '2', {a: 1, b: 2, c: 3}]]]},
    ].forEach(({ast, label, expected}): void => {
        // eslint-disable-next-line max-nested-callbacks
        it(`collects all the elements in a [${label}] array expression`, (): void => {
            const result = ExpressionCollector.collectElements(ast);

            expect(result).toEqual(expected);
        });
    });

    it('fails to collect an newable element in an array expression', (): void => {
        // eslint-disable-next-line require-jsdoc
        const fn = (): unknown[] => ExpressionCollector.collectElements(
            failingArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right
        );

        expect(fn).toThrow('AST expression cannot be resolved.');
    });

    [
        {ast: simpleObjectExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right, label: 'simple', expected: {a: 1, b: 2, c: 3}},
        {ast: nestedObjectExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right, label: 'nested', expected: {a: {b: {c: 1}}, d: {e: [1, 2, 3]}, f: [[1, 2, 3]]}},
    ].forEach(({ast, label, expected}): void => {
        it(`collects all the properties of a [${label}] object expression`, (): void => {
            const result = ExpressionCollector.collectProperties(ast);

            expect(result).toEqual(expected);
        });
    });

    it('fails to collect an newable property of an object expression', (): void => {
        // eslint-disable-next-line require-jsdoc
        const fn = (): object => ExpressionCollector.collectProperties(
            failingObjectExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right
        );

        expect(fn).toThrow('AST expression cannot be resolved.');
    });
});
