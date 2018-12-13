class ReturnDescriptor<T> {

    /**
     * The return type.
     *
     * @var {mixed}
     */
    private _type: T;

    /**
     * The return value.
     *
     * @var {mixed}
     */
    private _value: unknown;

    /**
     * Create a new parameter descriptor instance.
     *
     * @param {mixed} type
     * @param {mixed} value
     */
    public constructor(type: T, value: unknown) {
        this._type = type;
        this._value = value;
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
     * Get the value of the parameter.
     *
     * @returns {mixed}
     */
    public get value(): unknown {
        return this._value;
    }

}

export default ReturnDescriptor;
