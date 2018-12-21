import ExpressionCollector from './ExpressionCollector';
import ParameterDescriptor from '../Descriptors/ParameterDescriptor';
import ParsingError from './ParsingError';
import {isUndefined} from '../Support/helpers';
import {Interface} from '../Support/types';
import {DESIGN_PARAM_TYPES, INTERFACE_SYMBOLS} from '../Constants/metadata';

abstract class ParameterParserBase {

    /**
     * The ESTree-compatible abstract syntax tree representing the constructor.
     *
     * @var {Object}
     */
    protected _ast: any;

    /**
     * The class that owns the constructor to be parsed.
     *
     * @var {mixed}
     */
    protected _target: any;

    /**
     * The name of the function.
     *
     * @var {?string}
     */
    protected _name?: string;

    /**
     * The parameter types.
     *
     * @var {Array}
     */
    protected _types: any[];

    /**
     * The keys of any interfaces that might have been specified.
     *
     * @var {Map}
     */
    protected _keys?: Map<number, Symbol>;

    /**
     * Create a new parameter parser base instance.
     *
     * @param {Object} ast
     * @param {mixed} target
     * @param {?string} name
     */
    public constructor(ast: any, target: any, name?: string) {
        this._ast = ast;
        this._target = target;
        this._name = name;
        this._types = ParameterParserBase._fetchMetadata(
            DESIGN_PARAM_TYPES, this._target, this._name
        ) || [];
        this._keys = ParameterParserBase._fetchMetadata(
            INTERFACE_SYMBOLS, this._target, this._name
        );

        if (ast.param.length !== this._types.length) {
            throw new ParsingError('The number of parameters and types must match.');
        }
    }

    /**
     * Get all the parsed parameters.
     *
     * @returns {Array}
     */
    public all(): ParameterDescriptor[] {
        return this._ast
            .map((param: any, i: number): ParameterDescriptor => (
                this._makeDescriptor(param, this._types[i], i)
            ));
    }

    /**
     * Get the parsed parameter at the given index.
     *
     * @param {number} index
     * @returns {ParameterDescriptor}
     */
    public at(index: number): ParameterDescriptor {
        return this._makeDescriptor(
            this._ast[index], this._types[index], index
        );
    }

    /**
     * Attempt to fetch metadata.
     *
     * @param {string} key
     * @param {mixed} target
     * @param {?string} name
     * @returns {Array|Map}
     */
    private static _fetchMetadata(key: string, target: any, name?: string): any {
        if (!isUndefined(name)) {
            return Reflect.getMetadata(key, target, name);
        }

        return Reflect.getMetadata(key, target);
    }

    /**
     * Create a new parameter descriptor for the given parameter and type.
     *
     * @param {Object} param
     * @param {mixed} type
     * @param {number} position
     * @returns {ParameterDescriptor}
     */
    protected _makeDescriptor(param: any, type: any, position: number): ParameterDescriptor {
        const assignment = this._findAssignment(param);

        if (!isUndefined(assignment)) {
            // The parameter has a value assigned to it. Hence, we need to do
            // some parsing to fetch it. This can become quite complex in the
            // case of deeply nested parameter values
            return this._parseAssignment(assignment, type, position);
        }

        // Simplest case: parameter does not have a value assigned
        return new ParameterDescriptor({
            name: param.name,
            type: this._parseType(type, position),
            position
        });
    }

    /**
     * Find the assignment expression for the given parameter (if it exists).
     *
     * @param {Object} param
     * @returns {?Object}
     */
    protected abstract _findAssignment(param: any): any;

    /**
     * Parse an assignment pattern parameter type.
     *
     * @param {Object} assignment
     * @param {mixed} type
     * @param {number} position
     * @returns {ParameterDescriptor}
     */
    private _parseAssignment(assignment: any, type: any, position: number): ParameterDescriptor {
        const props = {
            name: assignment.left.name,
            type: this._parseType(type, position),
            position
        };

        switch (assignment.right.type) {
            case 'ArrayExpression':
                return this._parseArrayExpression(assignment.right, props);
            case 'ObjectExpression':
                return this._parseObjectExpression(assignment.right, props);
            case 'MemberExpression':
                return this._parseMemberExpression(assignment.right, props);
            case 'Literal':
                return this._parseLiteral(assignment.right, props);
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
    private _parseArrayExpression(expr: any, props: any): ParameterDescriptor {
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
    private _parseObjectExpression(expr: any, props: any): ParameterDescriptor {
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
    private _parseMemberExpression(expr: any, props: any): ParameterDescriptor {
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
    private _parseLiteral(literal: any, props: any): ParameterDescriptor {
        return new ParameterDescriptor({...props, value: literal.value});
    }

}

export default ParameterParserBase;
