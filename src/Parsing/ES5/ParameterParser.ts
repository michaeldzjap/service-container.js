import IParameterParser from '../../Contracts/Parsing/IParameterParser';
import ParameterDescriptor from '../../Descriptors/ParameterDescriptor';
import ParameterParserBase from '../ParameterParserBase';
import ParsingError from '../ParsingError';
import {isUndefined} from '../../Support/helpers';

class ParameterParser extends ParameterParserBase implements IParameterParser {

    /**
     * The block statement belonging to the function that owns the parameters.
     *
     * @var {Object}
     */
    private _block: any;

    /**
     * Create a new parameter parser instance.
     *
     * @param {Object} ast
     * @param {Object} block
     * @param {mixed} target
     * @param {?string} name
     */
    public constructor(ast: any, block: any, target: any, name?: string) {
        if (block.type !== 'BlockStatement') {
            throw new ParsingError('Invalid AST provided.');
        }

        super(ast, target, name);
    }

    /**
     * Find the assignment expression for the given parameter (if it exists).
     *
     * @param {Object} param
     * @returns {?Object}
     */
    protected _findAssignment(param: any): any {
        const statement = this._ast.body
            .filter((statement: any): boolean => statement.type === 'IfStatement')
            .find((statement: any): any => (
                statement.consequent.body[0].expression.left.name === param.name
            ));

        if (!isUndefined(statement)) {
            return statement.consequent.body[0].expression;
        }
    }

}

export default ParameterParser;
