import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import ParameterParser from './ParameterParser';
import ReturnDescriptor from '@src/Parsing/Descriptors/ReturnDescriptor';
import ReturnParser from './ReturnParser';
import {ClassMethod} from '@typings/.';

abstract class AbstractFunctionParser<T> {

    /**
     * The ESTree structure representing the function.
     *
     * @var {Object}
     */
    protected _tree: any;

    /**
     * The function to be parsed.
     *
     * @var {mixed}
     */
    private _target: ClassMethod<T>;

    /**
     * The parameter parser implementation.
     *
     * @var {ParameterParser}
     */
    protected _parameterParser: ParameterParser<T>;

    /**
     * The return parser implementation.
     *
     * @var {ReturnParser}
     */
    protected _returnParser?: ReturnParser<T>;

    /**
     * Create a new method parser instance.
     *
     * @param {Object} tree
     * @param {mixed} target
     */
    public constructor(tree: any, target: ClassMethod<T>) {
        this._tree = tree;
        this._target = target;

        this._initializeParameterParser();
        this._initializeReturnParser();
    }

    /**
     * Check if the function has any parameters.
     *
     * @returns {boolean}
     */
    public hasParameters(): boolean {
        return !!this._tree.params.length;
    }

    /**
     * Get the method parameters.
     *
     * @returns {Array}
     */
    public getParameters(): ParameterDescriptor<unknown>[] {
        if (!this._tree.params.length) return [];

        return this._parameterParser.all();
    }

    /**
     * Check if the function has a return value.
     *
     * @returns {boolean}
     */
    public hasReturnValue(): boolean {
        if (this._tree.body.type === 'BlockStatement') {
            return !!this._tree.body.body.length;
        }

        return false;
    }

    /**
     * Get the function return value and type.
     *
     * @returns {ReturnDescriptor|undefined}
     */
    public getReturnValue(): ReturnDescriptor<unknown> | undefined {
        if (this.hasReturnValue() && this._returnParser) {
            return this._returnParser.get();
        }
    }

    /**
     * Initialize the parameter parser.
     *
     * @param {mixed} params
     * @returns {void}
     */
    private _initializeParameterParser(): void {
        this._parameterParser = new ParameterParser<T>(this._tree.params, this._target);
    }

    /**
     * Initialize the return parser.
     *
     * @param {mixed} returnStatement
     * @returns {void}
     */
    private _initializeReturnParser(): void {
        const statement = this._findReturnStatement();

        if (statement) {
            this._returnParser = new ReturnParser<T>(statement, this._target);
        }
    }

    /**
     * Attempt to find a return statement.
     *
     * @returns {mixed|undefined}
     */
    private _findReturnStatement(): any | undefined {
        if (this._tree.body.type !== 'BlockStatement') return;

        return this._tree.body.body
            .find((_: any): any => _.type === 'ReturnStatement');
    }

}

export default AbstractFunctionParser;
