import AbstractClassAnalyser from '../AbstractClassAnalyser';
import FunctionAnalyser from '../FunctionAnalyser';
import IClassAnalyser from '../../../Contracts/Parsing/IClassAnalyser';
import IFunctionAnalyser from '../../../Contracts/Parsing/IFunctionAnalyser';
import ParserManager from '../../ParserManager';
import ParsingError from '../../ParsingError';
import {isUndefined, getName} from '../../../Support/helpers';

class ClassAnalyser extends AbstractClassAnalyser implements IClassAnalyser {

    /**
     * The ESTree-compatible abstract syntax tree representing a class.
     *
     * @var {Object}
     */
    private _ast: any;

    /**
     * The constructor analyser instance.
     *
     * @var {(IFunctionAnalyser|undefined)}
     */
    private _constructorAnalyser?: IFunctionAnalyser;

    /**
     * The method analyser instances.
     *
     * @var {Map}
     */
    private _methodAnalysers: Map<string, IFunctionAnalyser> = new Map;

    /**
     * Create a new class parser instance.
     *
     * @constructor
     * @param {Object} ast
     */
    public constructor(ast: any) {
        super();

        if (ast.type !== 'FunctionDeclaration') {
            throw new ParsingError('Invalid class AST provided.');
        }

        this._ast = ast;
    }

    /**
     * Determine if the class has a constructor.
     *
     * @returns {boolean}
     */
    public hasConstructor(): boolean {
        return !!this._ast.params.length && !!this._ast.body.body.length;
    }

    /**
     * Get the constructor analyser.
     *
     * @param {*} target
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public getConstructorAnalyser(target: any): IFunctionAnalyser | undefined {
        if (this.hasConstructor()) {
            this._constructorAnalyser = new FunctionAnalyser(this._ast, target);

            return this._constructorAnalyser;
        }
    }

    /**
     * Get the method analyser
     *
     * @param {*} target
     * @param {string} name
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public getMethodAnalyser(target: any, name: string): IFunctionAnalyser | undefined {
        if (!this._methodAnalysers.has(name)) {
            this._addMethodAnalyser(target, name);
        }

        return this._methodAnalysers.get(name);
    }

    /**
     * Add a method analyser instance for the given method.
     *
     * @param {*} target
     * @param {string} name
     * @returns {void}
     */
    private _addMethodAnalyser(target: any, name: string): void {
        const descriptor = Reflect.has(target, name)
            ? Reflect.getOwnPropertyDescriptor(target, name)
            : Reflect.getOwnPropertyDescriptor(target.prototype, name);

        if (isUndefined(descriptor)) {
            throw new Error(`Method does not exist on [${getName(target)}]`);
        }

        const ast = (new ParserManager).ast(
            this._stringify(descriptor.value)
        );

        this._methodAnalysers.set(
            name,
            new FunctionAnalyser(ast.body[0].expression.right, target, name)
        );
    }

    /**
     * Stringify the given function.
     *
     * @param {Function} fn
     * @returns {string}
     */
    private _stringify(fn: Function): string {
        return `fn = ${fn.toString()}`;
    }

}

export default ClassAnalyser;
