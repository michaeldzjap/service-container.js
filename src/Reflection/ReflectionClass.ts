import {ReflectionMethod} from '.';

class ReflectionClass {

    /**
     * The class that should be reflected.
     *
     * @var {Function|Symbol}
     */
    private _target: Function | Symbol;

    /**
     * Indicates if the reflected class is an interface.
     *
     * @var {boolean}
     */
    private _isInterface: boolean;

    /**
     * Create a new reflection class instance.
     *
     * @param {mixed} target
     */
    public constructor(target: Function | Symbol) {
        this._target = target;
        this._isInterface = false;
    }

    /**
     * Create a new reflection instance from a symbol representing an interface.
     *
     * @param {Symbol} key
     * @returns {ReflectionClass}
     */
    public static createFromInterface(key: Symbol): ReflectionClass {
        const instance = new ReflectionClass(key);
        instance._isInterface = true;

        return instance;
    }

    /**
     * Get the target of the reflected class.
     *
     * @returns {mixed|undefined}
     */
    public getTarget(): Function | Symbol | undefined {
        if (this.isInterface()) {
            return this._target as Symbol;
        }

        if (this.isInstantiable()) {
            return this._target as Function;
        }
    }

    /**
     * Get the name of the reflected class.
     *
     * @returns {string}
     */
    public getName(): string {
        if (typeof this._target === 'symbol') {
            return this._target.toString();
        }

        return (this._target as Function).name;
    }

    /**
     * Check if the reflected class is instantiable.
     *
     * NOTE: currently there is no (easy) way to find out if the reflected class
     * is abstract or instantiable at runtime, since JavaScript does not have
     * the concept of an abstract class baked in natively. Perhaps something is
     * possible using some metadata emitter library, but I haven't found one
     * which makes this possible yet...
     *
     * @returns {boolean}
     */
    public isInstantiable(): boolean {
        return !this._isInterface;
    }

    /**
     * Check if the reflected class is an interface.
     *
     * @returns {boolean}
     */
    public isInterface(): boolean {
        return this._isInterface;
    }

    /**
     * Get the constructor of the reflected class.
     *
     * @returns {ReflectionMethod}
     */
    public getConstructor(): ReflectionMethod {
        return new ReflectionMethod(this._target as Function, 'constructor');
    }

    /**
     * Create a new instance of the reflected class from the given arguments.
     *
     * @param {Array} dependencies
     * @returns {mixed}
     */
    public newInstanceArgs(dependencies: any[]): object {
        return new (this._target as any)(...dependencies);
    }

}

export default ReflectionClass;
