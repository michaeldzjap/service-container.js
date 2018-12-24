import IFunctionAnalyser from '../../Contracts/Parsing/IFunctionAnalyser';
import IParameterAnalyser from '../../Contracts/Parsing/IParameterAnalyser';
import ParameterAnalyser from './es5/ParameterAnalyser';
import ParsingError from '../ParsingError';

class FunctionAnalyser implements IFunctionAnalyser {

    /**
     * The ESTree-compatible abstract syntax tree representing a function.
     *
     * @var {Object}
     */
    protected _ast: any;

    /**
     * The class or function definition.
     *
     * @var {mixed}
     */
    private _target: any;

    /**
     * The parameter analyser instance.
     *
     * @var {IParameterAnalyser}
     */
    private _parameterAnalyser: IParameterAnalyser;

    /**
     * Create a new function analyser instance.
     *
     * @param {Object} ast
     * @param {mixed} target
     */
    public constructor(ast: any, target: any) {
        if (!(ast.type === 'FunctionDeclaration' || ast.type === 'FunctionExpression')) {
            throw new ParsingError('Invalid function AST provided.');
        }

        this._ast = ast;
        this._target = target;

        this._parameterAnalyser = new ParameterAnalyser(
            this._ast.params, this._ast.body, this._target
        );
    }

    /**
     * Determine if the function has any parameters.
     *
     * @returns {boolean}
     */
    public hasParameters(): boolean {
        return !!this._ast.params.length;
    }

    /**
     * Determine if the function has a body.
     *
     * @returns {boolean}
     */
    public hasBody(): boolean {
        return !!this._ast.body.body.length;
    }

    /**
     * Get the parameter analyser instance.
     *
     * @returns {IParameterAnalyser}
     */
    public getParameterAnalyser(): IParameterAnalyser {
        return this._parameterAnalyser;
    }

}

export default FunctionAnalyser;
