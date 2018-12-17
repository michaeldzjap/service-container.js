import ExpressionCollector from '@src/Parsing/ExpressionCollector';
import ParsingError from './ParsingError';
import ReturnDescriptor from '@src/Descriptors/ReturnDescriptor';
import {isNullOrUndefined} from '@src/Support/helpers';
import {DESIGN_RETURN_TYPE} from '@src/Constants/metadata';

class ReturnParser {

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
    private _target: any;

    /**
     * The name of the function.
     *
     * @var {string}
     */
    private _name?: string;

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
     * @param {Function} target
     * @param {string} name
     */
    public constructor(tree: any, target: any, name?: string) {
        this._tree = tree;
        this._target = target;
        this._name = name;
        this._type = isNullOrUndefined(this._name)
            ? Reflect.getMetadata(DESIGN_RETURN_TYPE, this._target)
            : Reflect.getMetadata(DESIGN_RETURN_TYPE, this._target, this._name);
    }

    /**
     * Get the parsed return.
     *
     * @returns {ReturnDescriptor}
     */
    public get(): ReturnDescriptor {
        return this._makeDescriptor();
    }

    /**
     * Create a new parameter descriptor for the given parameter and type.
     *
     * @returns {ReturnDescriptor}
     */
    private _makeDescriptor(): ReturnDescriptor {
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
    private _parseArrayExpression(): ReturnDescriptor {
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
    private _parseObjectExpression(): ReturnDescriptor {
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
    private _parseLiteral(): ReturnDescriptor {
        return new ReturnDescriptor(this._type, this._tree.argument.value);
    }

}

export default ReturnParser;
