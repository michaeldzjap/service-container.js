class ParameterDescriptor {

    /**
     * The parameter name.
     *
     * @var {string}
     */
    private _name: string;

    /**
     * The parameter type.
     *
     * @var {*}
     */
    private _type: any;

    /**
     * The parameter position.
     *
     * @var {number}
     */
    private _position: number;

    /**
     * The parameter value.
     *
     * @var {*}
     */
    private _value?: any;

    /**
     * Create a new parameter descriptor instance.
     *
     * @param {Object} props
     * @param {*} value
     */
    public constructor({name, type, position, value}:
        {name: string, type: any, position: number, value?: any}) { // eslint-disable-line
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
     * @returns {*}
     */
    public get type(): any {
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
     * @returns {*}
     */
    public get value(): any {
        return this._value;
    }

}

export default ParameterDescriptor;
