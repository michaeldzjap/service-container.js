import FunctionAnalyser from '../FunctionAnalyser';
import IClassAnalyser from '../../../Contracts/Parsing/IClassAnalyser';
import IFunctionAnalyser from '../../../Contracts/Parsing/IFunctionAnalyser';
import ParsingError from '../../ParsingError';

class ClassAnalyser implements IClassAnalyser {

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
     * Create a new class parser instance.
     *
     * @param {Object} ast
     * @param {mixed} target
     */
    public constructor(ast: any, target: any) {
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
     * @returns {IFunctionAnalyser}
     */
    public getConstructorAnalyser(): IFunctionAnalyser {
        return this._constructorAnalyser;
    }

}

export default ClassAnalyser;
