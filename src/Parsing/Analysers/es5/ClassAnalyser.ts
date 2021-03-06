import AbstractClassAnalyser from '../AbstractClassAnalyser';
import FunctionAnalyser from '../FunctionAnalyser';
import ClassAnalyserContract from '../../../Contracts/Parsing/ClassAnalyser';
import FunctionAnalyserContract from '../../../Contracts/Parsing/FunctionAnalyser';
import ParserManager from '../../ParserManager';
import ParsingError from '../../ParsingError';
import {isUndefined, getName} from '../../../Support/helpers';

class ClassAnalyser extends AbstractClassAnalyser implements ClassAnalyserContract {

    /**
     * The ESTree-compatible abstract syntax tree representing a class.
     *
     * @var {FunctionDeclaration}
     */
    private _ast: any;

    /**
     * The constructor analyser instance.
     *
     * @var {(FunctionAnalyser|undefined)}
     */
    private _constructorAnalyser?: FunctionAnalyserContract;

    /**
     * The method analyser instances.
     *
     * @var {Map}
     */
    private _methodAnalysers: Map<string, FunctionAnalyserContract> = new Map;

    /**
     * Create a new class parser instance.
     *
     * @constructor
     * @param {FunctionDeclaration} ast
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
     * @returns {(FunctionAnalyser|undefined)}
     */
    public getConstructorAnalyser(target: any): FunctionAnalyserContract | undefined {
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
     * @returns {(FunctionAnalyser|undefined)}
     */
    public getMethodAnalyser(target: any, name: string): FunctionAnalyserContract | undefined {
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
