import ExpressionCollector from '@src/Parsing/ExpressionCollector';
import ParsingError from './ParsingError';
import ReturnDescriptor from '@src/Parsing/Descriptors/ReturnDescriptor';
import {DESIGN_RETURN_TYPE} from '@src/Constants/metadata';

class ReturnParser<T> {

    /**
     * The ESTree structure representing the return.
     *
     * @var {Object}
     */
    private _tree: any;

    /**
     * The function the return belongs to.
     *
     * @var {mixed}
     */
    private _target: T;

    /**
     * The return type.
     *
     * @var {mixed}
     */
    private _type: any;

    /**
     * Create a new parameter parser instance.
     *
     * @param {Object} tree
     * @param {mixed} target
     */
    public constructor(tree: any, target: T) {
        this._tree = tree;
        this._target = target;
        this._type = (target as any).method
            ? Reflect.getMetadata(DESIGN_RETURN_TYPE, (target as any).target)
            : Reflect.getMetadata(
                DESIGN_RETURN_TYPE, (target as any).target, (target as any).method as string
            );
    }

    /**
     * Get the parsed return.
     *
     * @returns {ReturnDescriptor}
     */
    public get(): ReturnDescriptor<unknown> {
        return this._makeDescriptor<unknown>();
    }

    /**
     * Create a new parameter descriptor for the given parameter and type.
     *
     * @returns {ReturnDescriptor}
     */
    private _makeDescriptor<U>(): ReturnDescriptor<U> {
        switch (this._tree.argument.type) {
            case 'ArrayExpression':
                return this._parseArrayExpression();
            case 'ObjectExpression':
                return this._parseObjectExpression();
            case 'Literal':
                return this._parseLiteral();
            default:
                throw new ParsingError('Cannot parse the given return expression.');
        }
    }

    /**
     * Parse an array expression type.
     *
     * @returns {ReturnDescriptor}
     */
    private _parseArrayExpression<U>(): ReturnDescriptor<U> {
        return new ReturnDescriptor(
            this._type,
            ExpressionCollector.collectElements(this._tree.argument)
        );
    }

    /**
     * Parse an object expression type.
     *
     * @returns {ReturnDescriptor}
     */
    private _parseObjectExpression<U>(): ReturnDescriptor<U> {
        return new ReturnDescriptor(
            this._type,
            ExpressionCollector.collectProperties(this._tree.argument)
        );
    }

    /**
     * Parse a literal type.
     *
     * @returns {ReturnDescriptor}
     */
    private _parseLiteral<U>(): ReturnDescriptor<U> {
        return new ReturnDescriptor(this._type, this._tree.argument.value);
    }

}

export default ReturnParser;
