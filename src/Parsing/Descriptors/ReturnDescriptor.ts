class ReturnDescriptor {

    /**
     * The return type.
     *
     * @var {mixed}
     */
    private _type: any;

    /**
     * The return value.
     *
     * @var {mixed}
     */
    private _value: any;

    /**
     * Create a new parameter descriptor instance.
     *
     * @param {mixed} type
     * @param {mixed} value
     */
    public constructor(type: any, value: any) {
        this._type = type;
        this._value = value;
    }

    /**
     * Get the type of the parameter.
     *
     * @returns {mixed}
     */
    public get type(): any {
        return this._type;
    }

    /**
     * Get the value of the parameter.
     *
     * @returns {mixed}
     */
    public get value(): any {
        return this._value;
    }

}

export default ReturnDescriptor;
