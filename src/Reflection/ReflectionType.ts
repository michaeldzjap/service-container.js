class ReflectionType {

    /**
     * The reflected type.
     *
     * @var {mixed}
     */
    private _type: any;

    /**
     * Create a new reflection type instance.
     *
     * @param {mixed} type
     */
    public constructor(type: any) {
        this._type = type;
    }

    /**
     * Return the relevant global object.
     *
     * @returns {mixed}
     *
     * @throws {ReferenceError}
     */
    private static _getGlobal(): any {
        if (typeof window !== 'undefined') return window;

        if (typeof global !== 'undefined') return global;

        throw new ReferenceError('No global variable is defined.');
    }

    /**
     * Check if the type is built-in.
     *
     * NOTE: Any custom type that is added to the global object will be seen as
     * built in. That's rather unfortunate, but there doesn't seem to exist a
     * very reliable way to check if a given type is native / built in. Besides,
     * adding to the global object is considered to be bad practice anyway, and
     * is also completely redundant if there is a DI container available. Hence,
     * we can get away with this solution.
     *
     * @returns {boolean}
     */
    public isBuiltin(): boolean {
        const target = ReflectionType._getGlobal();

        if (target) {
            return !!target[this._type.prototype.constructor.name];
        }

        return false;
    }

}

export default ReflectionType;
