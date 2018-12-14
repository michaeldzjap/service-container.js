import AbstractFunctionParser from './AbstractFunctionParser';
import IFunctionParser from '@src/Contracts/Parsing/IFunctionParser';
import ParsingError from './ParsingError';

class FunctionParser extends AbstractFunctionParser implements IFunctionParser {

    /**
     * Create a new function parser instance.
     *
     * @param {Object} tree
     * @param {Function} target
     */
    public constructor(tree: any, target: Function) {
        if (tree.type !== 'FunctionDeclaration') {
            throw new ParsingError('Invalid ESTree structure provided.');
        }

        super(tree, target);
    }

}

export default FunctionParser;
