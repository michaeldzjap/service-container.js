class Callable<T> {

    /**
     * The class definition or instance to target.
     *
     * @var {mixed}
     */
    private _target: T;

    /**
     * The name of the method that is to be called on the class / instance.
     *
     * @var {string|undefined}
     */
    private _method?: string;

    /**
     * Indicates if the method to be called on the class / instance is static.
     *
     * @var {boolean}
     */
    private _isStatic: boolean = false;

    /**
     * Create a new callable instance.
     *
     * @param {mixed} target
     * @param {string|undefined} method
     * @param {boolean} isStatic
     */
    public constructor(target: T, method?: string, isStatic: boolean = false) {
        this._target = target;
        this._method = method;
        this._isStatic = isStatic;
    }

    /**
     * Get the class definition or instance.
     *
     * @returns {mixed}
     */
    public get target(): T {
        return this._target;
    }

    /**
     * Get the method name.
     *
     * @returns {string}
     */
    public get method(): string | undefined {
        return this._method;
    }

    /**
     * Determine if the method is static or not.
     *
     * @returns {boolean}
     */
    public get isStatic(): boolean {
        return this._isStatic;
    }

    /**
     * Return the callable properties as an array.
     *
     * @returns {Array}
     */
    public asArray(): [T, string | undefined, boolean] {
        return [this._target, this._method, this._isStatic];
    }

    /**
     * Call the specified method on the specified target with the given array of
     * arguments.
     *
     * @param {Array} args
     * @returns {mixed}
     */
    public call(args: any[]): any {
        if (!this._method) {
            throw new Error('Cannot call a non-existent function on a callable.');
        }

        if ((this._target as any).prototype && !this._isStatic) {
            throw new Error('Cannot call an instance method on a class definition.');
        }

        if (this._isStatic) {
            return (this._target as any).prototype
                ? this._target[this._method](...args)
                : this._target.constructor[this._method](...args);
        }

        return this._target[this._method](...args);
    }

}

export default Callable;
