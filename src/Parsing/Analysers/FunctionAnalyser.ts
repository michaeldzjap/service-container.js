import FunctionAnalyserContract from '../../Contracts/Parsing/FunctionAnalyser';
import ParameterAnalyserContract from '../../Contracts/Parsing/ParameterAnalyser';
import ParameterAnalyser from './es5/ParameterAnalyser';
import ParsingError from '../ParsingError';

class FunctionAnalyser implements FunctionAnalyserContract {

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
     * The name of the function.
     *
     * @var {(string|undefined)}
     */
    private _name?: string;

    /**
     * The parameter analyser instance.
     *
     * @var {ParameterAnalyser}
     */
    private _parameterAnalyser: ParameterAnalyserContract;

    /**
     * Create a new function analyser instance.
     *
     * @constructor
     * @param {Object} ast
     * @param {mixed} target
     * @param {(string|undefined)} name
     */
    public constructor(ast: any, target: any, name?: string) {
        if (!(ast.type === 'FunctionDeclaration' || ast.type === 'FunctionExpression')) {
            throw new ParsingError('Invalid function AST provided.');
        }

        this._ast = ast;
        this._target = target;
        this._name = name;

        this._parameterAnalyser = new ParameterAnalyser(
            this._ast.params, this._ast.body, this._target, this._name
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
     * @returns {ParameterAnalyser}
     */
    public getParameterAnalyser(): ParameterAnalyserContract {
        return this._parameterAnalyser;
    }

}

export default FunctionAnalyser;
