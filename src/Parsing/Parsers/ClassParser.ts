import ConstructorParser from './ConstructorParser';
import IClassParser from '@src/Contracts/Parsing/IClassParser';
import MethodParser from './MethodParser';
import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';

class ClassParser implements IClassParser {

    /**
     * The class the method belongs to.
     *
     * @var {mixed}
     */
    private _target: Function;

    /**
     * The ESTree structure representing the class declaration.
     *
     * @var {Object}
     */
    private _tree: any;

    /**
     * Create a new method parser instance.
     *
     * @param {Object} tree
     * @param {Function} target
     */
    public constructor(tree: any, target: Function) {
        if (tree.type !== 'ClassDeclaration') {
            throw new Error('Invalid ESTree structure provided.');
        }

        this._tree = tree;
        this._target = target;
    }

    /**
     * Check if the class has a constructor.
     *
     * @returns {boolean}
     */
    public hasConstructor(): boolean {
        return !!this._tree.body.body.length
            && this._tree.body.body[0].kind === 'constructor';
    }

    /**
     * Get the parameters of the class constructor.
     *
     * @returns {Array|undefined}
     */
    public getConstructorParameters(): ParameterDescriptor[] | undefined {
        const parser = this._initializeConstructorParser();

        if (parser) {
            return parser.getParameters();
        }
    }

    /**
     * Get the parameters of the given method.
     *
     * @param {string} name
     * @returns {Array|undefined}
     */
    public getMethodParameters(name: string): ParameterDescriptor[] | undefined {
        const parser = this._initializeMethodParser(name);

        if (parser) {
            return parser.getParameters();
        }
    }

    /**
     * Initialize the constructor parser.
     *
     * @returns {ConstructorParser|undefined}
     */
    private _initializeConstructorParser(): ConstructorParser | undefined {
        if (this.hasConstructor()) {
            return new ConstructorParser(
                this._tree.body.body[0],
                this._target
            );
        }
    }

    /**
     * Initialize the method parser.
     *
     * @param {string} name
     * @returns {MethodParser|undefined}
     */
    private _initializeMethodParser(name: string): MethodParser | undefined {
        const method = this._tree.body.body.find((_: any): boolean => (
            _.key.name === name
        ));

        if (method) {
            return new MethodParser(method, this._target, name);
        }
    }

    /**
     * Check if the class has any methods.
     *
     * @param {string} name
     * @returns {boolean}
     */
    private _hasMethod(name: string): boolean {
        if (!this._tree.body.body.length) return false;

        return !!this._tree.body.body.find((_: any): boolean => _.key.name === name);
    }

}

export default ClassParser;
