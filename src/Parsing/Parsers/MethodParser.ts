import AbstractFunctionParser from './AbstractFunctionParser';
import IFunctionParser from '@src/Contracts/Parsing/IFunctionParser';
import ParsingError from './ParsingError';

class MethodParser extends AbstractFunctionParser implements IFunctionParser {

    /**
     * Create a new method parser instance.
     *
     * @param {Object} tree
     * @param {mixed} target
     * @param {string} method
     */
    public constructor(tree: any, target: any, method: string) {
        if (tree.type !== 'MethodDefinition') {
            throw new ParsingError('Invalid ESTree structure provided.');
        }

        super(tree.value, target, method);
    }

    /**
     * Indicates if the parsed method is static.
     *
     * @returns {boolean}
     */
    public isStatic(): boolean {
        return !!this._tree.static;
    }

}

export default MethodParser;
