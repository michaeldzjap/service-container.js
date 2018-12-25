import AbstractClassAnalyser from '../AbstractClassAnalyser';
import FunctionAnalyser from '../FunctionAnalyser';
import IClassAnalyser from '../../../Contracts/Parsing/IClassAnalyser';
import IFunctionAnalyser from '../../../Contracts/Parsing/IFunctionAnalyser';
import ParserManager from '../../ParserManager';
import ParsingError from '../../ParsingError';
import {isUndefined} from '../../../Support/helpers';

class ClassAnalyser extends AbstractClassAnalyser implements IClassAnalyser {

    /**
     * The ESTree-compatible abstract syntax tree representing a class.
     *
     * @var {Object}
     */
    private _ast: any;

    /**
     * The class definition.
     *
     * @var {mixed}
     */
    private _target: any;

    /**
     * The constructor analyser instance.
     *
     * @var {IFunctionAnalyser}
     */
    private _constructorAnalyser: IFunctionAnalyser;

    /**
     * The method analyser instances.
     *
     * @var {Map}
     */
    private _methodAnalysers: Map<string, IFunctionAnalyser> = new Map;

    /**
     * Create a new class parser instance.
     *
     * @param {Object} ast
     * @param {*} target
     */
    public constructor(ast: any, target: any) {
        super();

        if (ast.type !== 'FunctionDeclaration') {
            throw new ParsingError('Invalid class AST provided.');
        }

        this._ast = ast;
        this._target = target;
        this._constructorAnalyser = new FunctionAnalyser(this._ast, this._target);
    }

    /**
     * Determine if the class has a constructor.
     *
     * @returns {boolean}
     */
    public hasConstructor(): boolean {
        return this._constructorAnalyser.hasBody()
            && this._constructorAnalyser.hasParameters();
    }

    /**
     * Get the constructor analyser.
     *
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public getConstructorAnalyser(): IFunctionAnalyser | undefined {
        if (this.hasConstructor()) {
            return this._constructorAnalyser;
        }
    }

    /**
     * Get the method analyser
     *
     * @param {string} name
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public getMethodAnalyser(name: string): IFunctionAnalyser | undefined {
        if (!this._methodAnalysers.has(name)) {
            this._addMethodAnalyser(name);
        }

        return this._methodAnalysers.get(name);
    }

    /**
     * Add a method analyser instance for the given method.
     *
     * @param {string} name
     * @returns {void}
     */
    private _addMethodAnalyser(name: string): void {
        const fn = Reflect.has(this._target, name)
            ? this._target[name] // Static method
            : this._target.prototype[name]; // Instance method

        if (isUndefined(fn)) {
            throw new Error(`Method does not exist on [${this._target.name}]`);
        }

        const ast = (new ParserManager).ast(`fn = ${fn.toString()}`);
        this._methodAnalysers.set(
            name,
            new FunctionAnalyser(ast.body[0].expression.right, this._target, name)
        );
    }

}

export default ClassAnalyser;
