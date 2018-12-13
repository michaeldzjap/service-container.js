import AbstractFunctionParser from './AbstractFunctionParser';
import IFunctionParser from '@src/Contracts/Parsing/IFunctionParser';
import ParsingError from './ParsingError';
import {ClassMethod} from '@typings/.';

class FunctionParser<T> extends AbstractFunctionParser<T> implements IFunctionParser {

    /**
     * Create a new function parser instance.
     *
     * @param {Object} tree
     * @param {mixed} target
     */
    public constructor(tree: any, target: ClassMethod<T>) {
        if (tree.type !== 'FunctionDeclaration') {
            throw new ParsingError('Invalid ESTree structure provided.');
        }

        super(tree, target);
    }

}

export default FunctionParser;
