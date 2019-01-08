import IFunctionAnalyser from '../../../Contracts/Parsing/IFunctionAnalyser';
import IParameterAnalyser from '../../../Contracts/Parsing/IParameterAnalyser';
import ParameterAnalyser from './ParameterAnalyser';
import {isUndefined} from '../../../Support/helpers';

abstract class AbstractMethodAnalyser implements IFunctionAnalyser {

    /**
     * The ESTree-compatible abstract syntax tree representing a function.
     *
     * @var {Object}
     */
    protected _ast: any;

    /**
     * The class or function definition.
     *
     * @var {*}
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
     * @constructor
     * @param {Object} ast
     * @param {*} target
     */
    public constructor(ast: any, target: any) {
        this._ast = ast;
        this._target = target;

        this._parameterAnalyser = new ParameterAnalyser(
            isUndefined(this._ast) ? [] : this._ast.value.params,
            this._target,
            this._ast.key.name
        );
    }

    /**
     * Determine if the method has any parameters.
     *
     * @returns {boolean}
     */
    public hasParameters(): boolean {
        if (isUndefined(this._ast)) return false;

        return !!this._ast.value.params.length;
    }

    /**
     * Determine if the method has a body.
     *
     * @returns {boolean}
     */
    public hasBody(): boolean {
        if (isUndefined(this._ast)) return false;

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

export default AbstractMethodAnalyser;
