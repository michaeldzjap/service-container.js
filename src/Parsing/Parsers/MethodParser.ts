import AbstractFunctionParser from './AbstractFunctionParser';
import IFunctionParser from '@src/Contracts/Parsing/IFunctionParser';
import ParsingError from './ParsingError';
import {ClassMethod} from '@typings/.';

class MethodParser<T> extends AbstractFunctionParser<T> implements IFunctionParser {

    /**
     * Create a new method parser instance.
     *
     * @param {Object} tree
     * @param {mixed} target
     */
    public constructor(tree: any, target: ClassMethod<T>) {
        if (tree.type !== 'MethodDefinition') {
            throw new ParsingError('Invalid ESTree structure provided.');
        }

        super(tree.value, target);
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
