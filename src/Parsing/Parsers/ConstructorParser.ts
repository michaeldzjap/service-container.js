import IConstructorParser from '@src/Contracts/Parsing/IConstructorParser';
import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';
import ParameterParser from './ParameterParser';
import ParsingError from './ParsingError';

class ConstructorParser implements IConstructorParser {

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
    private _target: any;

    /**
     * The parameter parser implementation.
     *
     * @var {ParameterParser}
     */
    private _parameterParser: ParameterParser;

    /**
     * Create a new method parser instance.
     *
     * @param {Object} tree
     * @param {Function} target
     */
    public constructor(tree: any, target: any) {
        if (tree.kind !== 'constructor') {
            throw new ParsingError('Invalid ESTree structure provided.');
        }

        this._tree = tree;
        this._target = target;

        this._parameterParser = this._initializeParameterParser();
    }

    /**
     * Get the name of the class the constructor belongs to.
     *
     * @returns {string}
     */
    public getClass(): string {
        return this._target.name;
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
    public getParameters(): ParameterDescriptor[] {
        if (!this._tree.value.params.length) return [];

        return this._parameterParser.all();
    }

    /**
     * Initialize the parameter parser.
     *
     * @returns {ParameterParser}
     */
    private _initializeParameterParser(): ParameterParser {
        return new ParameterParser(
            this._tree.value.params,
            this._target
        );
    }

}

export default ConstructorParser;
