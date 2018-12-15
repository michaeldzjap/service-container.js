import AbstractFunctionParser from './AbstractFunctionParser';
import IFunctionParser from '@src/Contracts/Parsing/IFunctionParser';
import ParsingError from './ParsingError';

class ArrowFunctionExpression extends AbstractFunctionParser implements IFunctionParser {

    /**
     * Create a new arrow function parser instance.
     *
     * @param {Object} tree
     * @param {mixed} target
     */
    public constructor(tree: any, target: Function) {
        if (tree.type !== 'ArrowFunctionExpression') {
            throw new ParsingError('Invalid ESTree structure provided.');
        }

        super(tree, target);
    }

    /**
     * Check if the function has a return value.
     *
     * @returns {boolean}
     */
    public hasReturnValue(): boolean {
        if (!(this._tree.body.type === 'Identifier'
            && this._tree.body.name === 'undefined')) {
            return true;
        }

        return super.hasReturnValue();
    }

}

export default ArrowFunctionExpression;
