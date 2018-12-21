import ClassParserBase from '../ClassParserBase';
import ConstructorParser from './ConstructorParser';
import IClassParser from '../../Contracts/Parsing/IClassParser';
import IConstructorParser from '../../Contracts/Parsing/IConstructorParser';
import ParsingError from '../ParsingError';

class ClassParser extends ClassParserBase implements IClassParser {

    /**
     * Create a new class parser instance.
     *
     * @param {mixed} target
     */
    public constructor(target: any) {
        super(target);

        if (this._ast.body[0].type !== 'FunctionDeclaration') {
            throw new ParsingError('Invalid AST provided.');
        }
    }

    /**
     * Determine if the class has a constructor.
     *
     * @returns {boolean}
     */
    public hasConstructor(): boolean {
        return !!this._ast.body[0].body.body.length;
    }

    /**
     * Get class constructor (if there is one).
     *
     * @returns {?IConstructorParser}
     */
    public getConstructor(): IConstructorParser | undefined {
        if (this.hasConstructor()) {
            return new ConstructorParser(this._ast.body[0], this._target);
        }
    }

}

export default ClassParser;
