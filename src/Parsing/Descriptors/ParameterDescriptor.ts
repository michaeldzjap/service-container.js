class ParameterDescriptor<T> {

    /**
     * The parameter name.
     *
     * @var {string}
     */
    private _name: string;

    /**
     * The parameter type.
     *
     * @var {mixed}
     */
    private _type: T;

    /**
     * The parameter position.
     *
     * @var {number}
     */
    private _position: number;

    /**
     * The parameter value.
     *
     * @var {mixed}
     */
    private _value?: unknown;

    /**
     * Create a new parameter descriptor instance.
     *
     * @param {Object} props
     * @param {mixed} value
     */
    public constructor({name, type, position, value}:
        {name: string, type: T, position: number, value?: any}) {
        this._name = name;
        this._type = type;
        this._position = position;
        this._value = value;
    }

    /**
     * Get the name of the parameter.
     *
     * @returns {string}
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Get the type of the parameter.
     *
     * @returns {mixed}
     */
    public get type(): T {
        return this._type;
    }

    /**
     * Get the position of the parameter.
     *
     * @returns {number}
     */
    public get position(): number {
        return this._position;
    }

    /**
     * Get the value of the parameter.
     *
     * @returns {mixed}
     */
    public get value(): unknown {
        return this._value;
    }

}

export default ParameterDescriptor;
