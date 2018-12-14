class ReturnDescriptor {

    /**
     * The return type.
     *
     * @var {Function}
     */
    private _type: Function;

    /**
     * The return value.
     *
     * @var {mixed}
     */
    private _value: unknown;

    /**
     * Create a new parameter descriptor instance.
     *
     * @param {Function} type
     * @param {mixed} value
     */
    public constructor(type: Function, value: unknown) {
        this._type = type;
        this._value = value;
    }

    /**
     * Get the type of the parameter.
     *
     * @returns {mixed}
     */
    public get type(): Function {
        return this._type;
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

export default ReturnDescriptor;
