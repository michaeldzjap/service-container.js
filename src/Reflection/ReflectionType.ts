class ReflectionType<T> {

    /**
     * The reflected type.
     *
     * @var {mixed}
     */
    private _type: T;

    /**
     * Create a new reflection type instance.
     *
     * @param {mixed} type
     */
    public constructor(type: T) {
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
            return !!target[(this._type as any).prototype.constructor.name];
        }

        return false;
    }

}

export default ReflectionType;
