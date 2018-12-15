import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import ParameterParser from './ParameterParser';
import ReturnDescriptor from '@src/Parsing/Descriptors/ReturnDescriptor';
import ReturnParser from './ReturnParser';

abstract class AbstractFunctionParser {

    /**
     * The ESTree structure representing the function.
     *
     * @var {Object}
     */
    protected _tree: any;

    /**
     * The function to be parsed.
     *
     * @var {Function}
     */
    private _target: Function;

    /**
     * The name of the function.
     *
     * @var {string|undefined}
     */
    protected _name?: string;

    /**
     * The parameter parser implementation.
     *
     * @var {ParameterParser}
     */
    protected _parameterParser: ParameterParser;

    /**
     * The return parser implementation.
     *
     * @var {ReturnParser}
     */
    protected _returnParser?: ReturnParser;

    /**
     * Create a new method parser instance.
     *
     * @param {Object} tree
     * @param {Function} target
     * @param {string|undefined} name
     */
    public constructor(tree: any, target: Function, name?: string) {
        this._tree = tree;
        this._target = target;
        this._name = name;

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
    public getParameters(): ParameterDescriptor[] {
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
    public getReturnValue(): ReturnDescriptor | undefined {
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
        this._parameterParser = new ParameterParser(
            this._tree.params, this._target, this._name
        );
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
            this._returnParser = new ReturnParser(
                statement, this._target, this._name
            );
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
