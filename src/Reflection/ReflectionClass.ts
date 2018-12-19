import ReflectionError from './ReflectionError';
import ReflectionMethod from './ReflectionMethod';
import {isSymbol, isString, isNullOrUndefined} from '../Support/helpers';
import {Interface} from '../Support/types';

class ReflectionClass {

    /**
     * The class that should be reflected.
     *
     * @var {mixed}
     */
    private _target: any;

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
    public constructor(target: any) {
        this._target = target;
        this._isInterface = false;
    }

    /**
     * Create a new reflection instance from a symbol representing an interface.
     *
     * @param {Interface} contract
     * @returns {ReflectionClass}
     */
    public static createFromInterface(contract: Interface): ReflectionClass {
        const instance = new ReflectionClass(contract);
        instance._isInterface = true;

        return instance;
    }

    /**
     * Get the target of the reflected class.
     *
     * @returns {mixed}
     */
    public getTarget(): any {
        return this._target;
    }

    /**
     * Get the name of the reflected class.
     *
     * @returns {string}
     */
    public getName(): string {
        if (this._isInterface && isSymbol(this._target.key)) {
            const result = /Symbol\(([^)]+)\)/.exec(this._target.key.toString());

            if (isNullOrUndefined(result)) {
                throw new ReflectionError('Could not determine interface name.');
            }

            return result[1];
        }

        if (this._isInterface && isString(this._target.key)) {
            return this._target.key;
        }

        return this._target.name;
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
     *
     * @throws {Error}
     */
    public getConstructor(): ReflectionMethod {
        if (this.isInterface()) {
            throw new ReflectionError('An interface does not have a constructor.');
        }

        return new ReflectionMethod(this._target, 'constructor');
    }

    /**
     * Create a new instance of the reflected class from the given arguments.
     *
     * @param {Array} dependencies
     * @returns {mixed}
     */
    public newInstanceArgs(dependencies: any[]): any {
        return new this._target(...dependencies);
    }

}

export default ReflectionClass;
