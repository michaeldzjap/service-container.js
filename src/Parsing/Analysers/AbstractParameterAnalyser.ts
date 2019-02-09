import ExpressionCollector from './ExpressionCollector';
import Interface from '../../Support/Interface';
import ParameterDescriptor from '../../Descriptors/ParameterDescriptor';
import ParsingError from '../ParsingError';
import {isUndefined, getName} from '../../Support/helpers';
import {DESIGN_PARAM_TYPES, INTERFACE_SYMBOLS} from '../../constants/metadata';

abstract class AbstractParameterAnalyser {

    /**
     * The ESTree-compatible abstract syntax tree representing an array of
     * function parameters.
     *
     * @var {Object}
     */
    protected _ast: any;

    /**
     * The class definition.
     *
     * @var {*}
     */
    protected _target: any;

    /**
     * The name of the function / method.
     *
     * @var {(string|undefined)}
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
    protected _keys?: Map<number, symbol>;

    /**
     * Create a new parameter parser base instance.
     *
     * @constructor
     * @param {Array} ast
     * @param {*} target
     * @param {(string|undefined)} name
     */
    public constructor(ast: any, target: any, name?: string) {
        this._ast = ast;
        this._target = target;
        this._name = name;

        // Get the parameter types and interface keys from metadata
        this._types = this._fetchMetadata(DESIGN_PARAM_TYPES) || [];
        this._keys = this._fetchMetadata(INTERFACE_SYMBOLS);

        if (this._ast.length !== this._types.length) {
            this._throwError();
        }
    }

    /**
     * Get all the parsed parameters.
     *
     * @returns {ParameterDescriptor[]}
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
     * @returns {(Array|Map|undefined)}
     */
    private _fetchMetadata(key: string): any {
        if (!isUndefined(this._name) && this._name !== 'constructor') {
            return Reflect.getMetadata(key, this._target, this._name);
        }

        return Reflect.getMetadata(key, this._target);
    }

    /**
     * Throw an error.
     *
     * @returns {void}
     *
     * @throws {ParsingError}
     */
    private _throwError(): void {
        let message = 'The number of parameters and types must match. ';
        message += 'Perhaps you forgot to apply the @injectable decorator ';
        message += `to the [${getName(this._target)}] target?`;

        throw new ParsingError(message);
    }

    /**
     * Create a new parameter descriptor for the given parameter and type.
     *
     * @param {Object} param
     * @param {*} type
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
     * @returns {(Object|undefined)}
     */
    protected abstract _findAssignment(param: any): any;

    /**
     * Parse an assignment pattern parameter type.
     *
     * @param {Object} assignment
     * @param {*} type
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
     * @param {*} type
     * @param {number} position
     * @returns {*}
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

export default AbstractParameterAnalyser;
