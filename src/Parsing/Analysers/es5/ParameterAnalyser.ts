import {
    AssignmentExpression,
    BlockStatement,
    Statement
} from 'cherow/dist/types/estree';

import IParameterAnalyser from '../../../Contracts/Parsing/IParameterAnalyser';
import AbstractParameterAnalyser from '../AbstractParameterAnalyser';
import ParsingError from '../../ParsingError';
import {isUndefined} from '../../../Support/helpers';

class ParameterAnalyser extends AbstractParameterAnalyser implements IParameterAnalyser {

    /**
     * The block statement belonging to the function that owns the parameters.
     *
     * @var {Object}
     */
    private _block: any;

    /**
     * Create a new parameter parser instance.
     *
     * @constructor
     * @param {Object} ast
     * @param {BlockStatement} block
     * @param {*} target
     * @param {(string|undefined)} name
     */
    public constructor(ast: any, block: BlockStatement, target: any, name?: string) {
        if (block.type !== 'BlockStatement') {
            throw new ParsingError('Invalid parameter AST provided.');
        }

        super(ast, target, name);

        this._block = block;
    }

    /**
     * Find the assignment expression for the given parameter (if it exists).
     *
     * @param {Object} param
     * @returns {(AssignmentExpression|undefined)}
     */
    protected _findAssignment(param: {type: string, name: string}): AssignmentExpression | undefined {
        const statements = this._block.body
            .filter((_: Statement): boolean => _.type === 'IfStatement');

        for (const statement of statements) {
            const expression = this._filterConsequentBody(
                statement.consequent.body, param
            );

            if (!isUndefined(expression)) return expression;
        }
    }

    /**
     * Filter the body property of a consequent property in an attempt to find
     * the assignment expression that corresponds to the given parameter.
     *
     * @param {Array} body
     * @param {Object} param
     * @returns {(AssignmentExpression|undefined)}
     */
    private _filterConsequentBody(body: any, param: {type: string, name: string}): AssignmentExpression | undefined {
        for (const statement of body) {
            if (statement.expression.type === 'AssignmentExpression'
                && statement.expression.left.name === param.name) {
                return statement.expression;
            }
        }
    }

}

export default ParameterAnalyser;
