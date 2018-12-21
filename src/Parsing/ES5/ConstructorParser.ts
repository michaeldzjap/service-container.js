import IConstructorParser from '../../Contracts/Parsing/IConstructorParser';
import IParameterParser from '../../Contracts/Parsing/IParameterParser';
import ParameterParser from './ParameterParser';
import ParsingError from '../ParsingError';

class ConstructorParser implements IConstructorParser {

    /**
     * The ESTree-compatible abstract syntax tree representing the constructor.
     *
     * @var {Object}
     */
    protected _ast: any;

    /**
     * The class that owns the constructor to be parsed.
     *
     * @var {mixed}
     */
    protected _target: any;

    /**
     * Create a new constructor parser instance.
     *
     * @param {Object} ast
     * @param {any} target
     */
    public constructor(ast: any, target: any) {
        this._ast = ast;
        this._target = target;

        if (this._ast.type !== 'FunctionDeclaration') {
            throw new ParsingError('Invalid AST provided.');
        }
    }

    /**
     * Check if the constructor has any parameters.
     *
     * @returns {boolean}
     */
    public hasParameters(): boolean {
        return !!this._ast.params.length;
    }

    /**
     * Get the constructor parameters.
     *
     * @returns {?IParameterParser}
     */
    public getParameters(): IParameterParser | undefined {
        if (this.hasParameters()) {
            return new ParameterParser(
                this._ast.params, this._ast.body, this._target
            );
        }
    }

}

export default ConstructorParser;
