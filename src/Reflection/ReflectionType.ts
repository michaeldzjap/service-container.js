class ReflectionType {

    /**
     * The reflected type.
     *
     * @var {Function}
     */
    private _type: Function;

    /**
     * Create a new reflection type instance.
     *
     * @param {Function} type
     */
    public constructor(type: Function) {
        this._type = type;
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
        const target = window || global;

        if (target) {
            return !!target[this._type.prototype.constructor.name];
        }

        return false;
    }

}

export default ReflectionType;
