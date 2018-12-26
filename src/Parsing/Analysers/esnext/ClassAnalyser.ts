import AbstractClassAnalyser from '../AbstractClassAnalyser';
import ConstructorAnalyser from './ConstructorAnalyser';
import IClassAnalyser from '../../../Contracts/Parsing/IClassAnalyser';
import IFunctionAnalyser from '../../../Contracts/Parsing/IFunctionAnalyser';
import MethodAnalyser from './MethodAnalyser';
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
     * Create a new class analyser instance.
     *
     * @param {Object} ast
     */
    public constructor(ast: any) {
        super();

        if (ast.type !== 'ClassDeclaration') {
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
        return !!this._constructorAnalyser;
    }

    /**
     * Get the constructor analyser.
     *
     * @param {*} target
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public getConstructorAnalyser(target: any): IFunctionAnalyser | undefined {
        this._initialiseConstructorAnalyser(target);

        return this._constructorAnalyser;
    }

    /**
     * Get the method analyser
     *
     * @param {*} target
     * @param {string} name
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public getMethodAnalyser(target: any, name: string): IFunctionAnalyser | undefined {
        this._initialiseMethodAnalyser(target, name);

        return this._methodAnalysers.get(name);
    }

    /**
     * Initialise the constructor analyser.
     *
     * @param {*} target
     * @returns {void}
     */
    private _initialiseConstructorAnalyser(target: any): void {
        const constructor = this._findConstructor();

        if (!isUndefined(constructor)) {
            this._constructorAnalyser = new ConstructorAnalyser(
                constructor, target
            );
        }
    }

    /**
     * Attempt to find the constructor definition in the class body.
     *
     * @returns {(Object|undefined)}
     */
    private _findConstructor(): any {
        return this._ast.body.body.find(
            (definition: any): boolean => definition.kind === 'constructor'
        );
    }

    /**
     * Initialise the method analysers.
     *
     * @param {*} target
     * @param {string} name
     * @returns {void}
     */
    private _initialiseMethodAnalyser(target: any, name: string): void {
        const definition = this._ast.body.body.find((definition: any): boolean => (
            definition.key.name === name && definition.type === 'MethodDefinition'
        ));

        if (!isUndefined(definition)) {
            this._methodAnalysers.set(
                name, new MethodAnalyser(definition, target)
            );
        }
    }

}

export default ClassAnalyser;
