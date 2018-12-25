import ExpressionCollector from '@src/Parsing/Analysers/ExpressionCollector';
import * as ExpressionCollectorStub from '@helpers/Stubs/esnext/ExpressionCollectorStub.json';
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
        {
            version: 'es5',
            ast: [
                simpleArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right,
                nestedArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right,
                mixedSimpleArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right,
                mixedNestedArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right,
            ]
        },
        {
            version: 'esnext',
            ast: [
                ExpressionCollectorStub.body[0].body.body[0].value.params[0].right,
                ExpressionCollectorStub.body[0].body.body[1].value.params[0].right,
                ExpressionCollectorStub.body[0].body.body[2].value.params[0].right,
                ExpressionCollectorStub.body[0].body.body[3].value.params[0].right,
            ]
        }
    ].forEach(({version, ast}): void => {
        describe(`version: ${version}`, (): void => {
            [
                {label: 'simple', expected: [1, 2, 3]},
                {label: 'nested', expected: [[[1]], [[1, 2]], [[1, 2, 3]]]},
                {label: 'mixed simple', expected: [1, '2', {a: 1, b: 2, c: 3}]},
                {label: 'mixed nested', expected: [[[1, '2', {a: 1, b: 2, c: 3}]]]},
            ].forEach(({label, expected}, i: number): void => {
                // eslint-disable-next-line max-nested-callbacks
                it(`collects all the elements in a [${label}] array expression`, (): void => {
                    const result = ExpressionCollector.collectElements(ast[i]);

                    expect(result).toEqual(expected);
                });
            });
        });
    });

    [
        {
            version: 'es5',
            ast: ExpressionCollectorStub.body[0].body.body[4].value.params[0].right
        },
        {
            version: 'esnext',
            ast: failingArrayExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right
        },
    ].forEach(({version, ast}): void => {
        describe(`version: ${version}`, (): void => {
            it('fails to collect an newable element in an array expression', (): void => {
                // eslint-disable-next-line require-jsdoc
                const fn = (): unknown[] => ExpressionCollector.collectElements(ast);

                expect(fn).toThrow('AST expression cannot be resolved.');
            });
        });
    });

    [
        {
            version: 'es5',
            ast: [
                ExpressionCollectorStub.body[0].body.body[5].value.params[0].right,
                ExpressionCollectorStub.body[0].body.body[6].value.params[0].right,
            ]
        },
        {
            version: 'esnext',
            ast: [
                simpleObjectExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right,
                nestedObjectExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right,
            ]
        },
    ].forEach(({version, ast}): void => {
        describe(`version: ${version}`, (): void => {
            [
                {label: 'simple', expected: {a: 1, b: 2, c: 3}},
                {label: 'nested', expected: {a: {b: {c: 1}}, d: {e: [1, 2, 3]}, f: [[1, 2, 3]]}},
            ].forEach(({label, expected}, i: number): void => {
                it(`collects all the properties of a [${label}] object expression`, (): void => {
                    const result = ExpressionCollector.collectProperties(ast[i]);

                    expect(result).toEqual(expected);
                });
            });
        });
    });

    [
        {
            version: 'es5',
            ast: ExpressionCollectorStub.body[0].body.body[7].value.params[0].right
        },
        {
            version: 'esnext',
            ast: failingObjectExpression.body[0].expression.right.body.body[0].consequent.body[0].expression.right
        },
    ].forEach(({version, ast}): void => {
        describe(`version: ${version}`, (): void => {
            it('fails to collect an newable property of an object expression', (): void => {
                // eslint-disable-next-line require-jsdoc
                const fn = (): object => ExpressionCollector.collectProperties(ast);

                expect(fn).toThrow('AST expression cannot be resolved.');
            });
        });
    });
});
