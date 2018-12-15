import 'reflect-metadata';

import ExpressionCollector from '@src/Parsing/ExpressionCollector';
import IParameterParser from '@src/Contracts/Parsing/IParameterParser';
import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import {isNullOrUndefined} from '@src/Support/helpers';
import {Interface} from '@typings/index';
import {DESIGN_PARAM_TYPES, INTERFACE_SYMBOLS} from '@src/Constants/metadata';

class ParameterParser implements IParameterParser {

    /**
     * The ESTree structure representing an array of function parameters.
     *
     * @var {Array}
     */
    private _tree: any[];

    /**
     * The function the parameters belong to.
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
     * The parameter types.
     *
     * @var {Array}
     */
    private _types: any[];

    /**
     * The keys of any interfaces that might have been specified.
     *
     * @var {Map}
     */
    private _keys?: Map<number, Symbol>;

    /**
     * Create a new parameter parser instance.
     *
     * @param {Array} tree
     * @param {mixed} target
     * @param {string} name
     */
    public constructor(tree: any[], target: any, name?: string) {
        const types = this._fetchMetadata(DESIGN_PARAM_TYPES, target, name) || [];

        if (tree.length !== types.length) {
            throw new Error('The number of parameters and types must match.');
        }

        this._tree = tree;
        this._target = target;
        this._name = name;
        this._types = types;
        this._keys = this._fetchMetadata(INTERFACE_SYMBOLS, target, name);
    }

    /**
     * Get all the parsed parameters.
     *
     * @returns {Array}
     */
    public all(): ParameterDescriptor<any>[] {
        return this._tree
            .map((param: any, i: number): ParameterDescriptor<any> => (
                this._makeDescriptor(param, this._types[i], i)
            ));
    }

    /**
     * Get the parsed parameter at the given index.
     *
     * @param {number} index
     * @returns {ParameterDescriptor}
     */
    public at(index: number): ParameterDescriptor<any> {
        return this._makeDescriptor(
            this._tree[index], this._types[index], index
        );
    }

    /**
     * Create a new parameter descriptor for the given parameter and type.
     *
     * @param {Object} param
     * @param {mixed} type
     * @param {number} position
     * @returns {ParameterDescriptor}
     */
    private _makeDescriptor(param: any, type: any, position: number): ParameterDescriptor<any> {
        // The parameter has a value assigned to it. Hence, we need to do
        // some parsing to fetch it. This can become quite complex in the
        // case of deeply nested parameter values
        if (param.type === 'AssignmentPattern') {
            return this._parseAssignmentPattern(param, type, position);
        }

        // Simplest case: parameter does not have a value assigned
        return new ParameterDescriptor({
            name: param.name,
            type: this._parseType(type, position),
            position
        });
    }

    /**
     * Parse an assignment pattern parameter type.
     *
     * @param {Object} param
     * @param {mixed} type
     * @param {number} position
     * @returns {ParameterDescriptor}
     */
    private _parseAssignmentPattern(param: any, type: any, position: number): ParameterDescriptor<any> {
        const props = {
            name: param.left.name,
            type: this._parseType(type, position),
            position
        };

        switch (param.right.type) {
            case 'ArrayExpression':
                return this._parseArrayExpression(param.right, props);
            case 'ObjectExpression':
                return this._parseObjectExpression(param.right, props);
            case 'MemberExpression':
                return this._parseMemberExpression(param.right, props);
            case 'Literal':
                return this._parseLiteral(param.right, props);
            default:
                return new ParameterDescriptor(props);
        }
    }

    /**
     * Parse the parameter type.
     *
     * @param {mixed} type
     * @param {number} position
     * @returns {mixed}
     */
    private _parseType(type: any, position: number): any {
        if (this._keys && this._keys.has(position)) {
            type = Interface;
            type.key = this._keys.get(position);
        }

        return type;
    }

    /**
     * Parse an array expression type.
     *
     * @param {Object} expr
     * @param {Object} props
     * @returns {ParameterDescriptor}
     */
    private _parseArrayExpression(expr: any, props: any): ParameterDescriptor<any> {
        return new ParameterDescriptor({
            ...props,
            value: ExpressionCollector.collectElements(expr)
        });
    }

    /**
     * Parse an object expression type.
     *
     * @param {Object} expr
     * @param {Object} props
     * @returns {ParameterDescriptor}
     */
    private _parseObjectExpression(expr: any, props: any): ParameterDescriptor<any> {
        return new ParameterDescriptor({
            ...props,
            value: ExpressionCollector.collectProperties(expr)
        });
    }

    /**
     * Parse a member expression type.
     *
     * @param {Object} expr
     * @param {Object} props
     * @returns {ParameterDescriptor}
     */
    private _parseMemberExpression(expr: any, props: any): ParameterDescriptor<any> {
        return new ParameterDescriptor({
            ...props,
            value: expr.object.name
        });
    }

    /**
     * Parse a literal type.
     *
     * @param {Object} literal
     * @param {Object} props
     * @returns {ParameterDescriptor}
     */
    private _parseLiteral(literal: any, props: any): ParameterDescriptor<any> {
        return new ParameterDescriptor({...props, value: literal.value});
    }

    /**
     * Attempt to fetch metadata.
     *
     * @param {string} key
     * @param {mixed} target
     * @param {string|undefined} name
     * @returns {Array|Map}
     */
    private _fetchMetadata(key: string, target: any, name?: string): any {
        if (!isNullOrUndefined(name)) {
            return Reflect.getMetadata(key, target, name);
        }

        return Reflect.getMetadata(key, target);
    }

}

export default ParameterParser;
