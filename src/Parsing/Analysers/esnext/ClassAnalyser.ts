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
     * The class definition.
     *
     * @var {*}
     */
    private _target: any;

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
     * @param {*} target
     */
    public constructor(ast: any, target: any) {
        super();

        if (ast.type !== 'ClassDeclaration') {
            throw new ParsingError('Invalid class AST provided.');
        }

        this._ast = ast;
        this._target = target;

        this._initialiseConstructorAnalyser();
        this._initialiseMethodAnalysers();
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
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public getConstructorAnalyser(): IFunctionAnalyser | undefined {
        return this._constructorAnalyser;
    }

    /**
     * Get the method analyser
     *
     * @param {string} name
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public getMethodAnalyser(name: string): IFunctionAnalyser | undefined {
        return this._methodAnalysers.get(name);
    }

    /**
     * Initialise the constructor analyser.
     *
     * @returns {void}
     */
    private _initialiseConstructorAnalyser(): void {
        const constructor = this._findConstructor();

        if (!isUndefined(constructor)) {
            this._constructorAnalyser = new ConstructorAnalyser(
                constructor, this._target
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
     * @returns {void}
     */
    private _initialiseMethodAnalysers(): void {
        for (const definition of this._ast.body.body) {
            if (definition.type === 'MethodDefinition') {
                this._methodAnalysers.set(
                    definition.key.name,
                    new MethodAnalyser(definition, this._target)
                );
            }
        }
    }

}

export default ClassAnalyser;
