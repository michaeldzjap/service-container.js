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
     * @param {Object} block
     * @param {*} target
     * @param {(string|undefined)} name
     */
    public constructor(ast: any, block: any, target: any, name?: string) {
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
     * @returns {(Object|undefined)}
     */
    protected _findAssignment(param: any): any {
        const statement = this._block.body
            .filter((statement: any): boolean => statement.type === 'IfStatement')
            .find((statement: any): any => (
                statement.consequent.body[0].expression.left.name === param.name
            ));

        if (!isUndefined(statement)) {
            return statement.consequent.body[0].expression;
        }
    }

}

export default ParameterAnalyser;
