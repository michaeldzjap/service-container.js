class MethodDescriptor {

    /**
     * The method name.
     *
     * @var {string}
     */
    private _name: string;

    /**
     * Indicates if the method is static.
     *
     * @var {mixed}
     */
    private _isStatic: boolean;

    /**
     * Create a new parameter descriptor instance.
     *
     * @param {string} name
     * @param {boolean} isStatic
     */
    public constructor(name: string, isStatic: boolean) {
        this._name = name;
        this._isStatic = isStatic;
    }

    /**
     * Get the name of the method.
     *
     * @returns {string}
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Indicates if the method is static.
     *
     * @returns {boolean}
     */
    public get isStatic(): boolean {
        return this._isStatic;
    }

}

export default MethodDescriptor;
