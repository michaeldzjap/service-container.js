import {isInstance, isInstantiable} from '../Support/helpers';
import {Instantiable, Instance} from '../Support/types';

class Callable<T> {

    /**
     * The class definition or instance to target.
     *
     * @var {Instantiable|Instance}
     */
    private _target: Instantiable<T> | Instance<T>;

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
     * @param {Instantiable|Instance} target
     * @param {string|undefined} method
     * @param {boolean} isStatic
     */
    public constructor(target: Instantiable<T> | Instance<T>, method?: string, isStatic: boolean = false) {
        this._target = target;
        this._method = method;
        this._isStatic = isStatic;
    }

    /**
     * Get the class definition or instance.
     *
     * @returns {Instantiable|Instance}
     */
    public get target(): Instantiable<T> | Instance<T> {
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
    public asArray(): [Instantiable<T> | Instance<T>, string | undefined, boolean] {
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
            throw new Error(
                'Cannot call a non-existent function on a callable.'
            );
        }

        if (isInstantiable(this._target) && !this._isStatic) {
            throw new Error(
                'Cannot call an instance method on a class definition.'
            );
        }

        if (isInstance(this._target) && this._isStatic) {
            return this._target.constructor[this._method](...args);
        }

        return this._target[this._method](...args);
    }

}

export default Callable;
