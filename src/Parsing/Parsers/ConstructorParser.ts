import IConstructorParser from '@src/Contracts/Parsing/IConstructorParser';
import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import ParameterParser from './ParameterParser';
import ParsingError from './ParsingError';
import {ClassMethod} from '@typings/.';

class ConstructorParser<T> implements IConstructorParser {

    /**
     * The ESTree structure representing the class constructor.
     *
     * @var {Object}
     */
    private _tree: any;

    /**
     * The class the constructor belongs to.
     *
     * @var {mixed}
     */
    private _target: T;

    /**
     * The parameter parser implementation.
     *
     * @var {ParameterParser}
     */
    private _parameterParser: ParameterParser<T>;

    /**
     * Create a new method parser instance.
     *
     * @param {Object} tree
     * @param {mixed} target
     */
    public constructor(tree: any, target: T) {
        if (tree.kind !== 'constructor') {
            throw new ParsingError('Invalid ESTree structure provided.');
        }

        this._tree = tree;
        this._target = target;

        this._initializeParameterParser();
    }

    /**
     * Get the name of the class the constructor belongs to.
     *
     * @returns {string}
     */
    public getClass(): string {
        return (this._target as any).name;
    }

    /**
     * Check if the constructor has any parameters.
     *
     * @returns {boolean}
     */
    public hasParameters(): boolean {
        return !!this._tree.value.params.length;
    }

    /**
     * Get the method parameters.
     *
     * @returns {Array}
     */
    public getParameters(): ParameterDescriptor<unknown>[] {
        if (!this._tree.value.params.length) return [];

        return this._parameterParser.all();
    }

    /**
     * Initialize the parameter parser.
     *
     * @returns {void}
     */
    private _initializeParameterParser(): void {
        this._parameterParser = new ParameterParser<T>(
            this._tree.value.params,
            {target: this._target} as unknown as ClassMethod<T>
        );
    }

}

export default ConstructorParser;
