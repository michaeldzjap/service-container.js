import Interface from '../Support/Interface';
import ReflectionError from './ReflectionError';
import ReflectionMethod from './ReflectionMethod';
import {isSymbol, isString, getSymbolName} from '../Support/helpers';

class ReflectionClass {

    /**
     * The class that should be reflected.
     *
     * @var {*}
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
     * @constructor
     * @param {*} target
     */
    public constructor(target: any) {
        this._target = target;
        this._isInterface = false;
    }

    /**
     * Create a new reflection instance from an interface instance.
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
     * @returns {*}
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
            return getSymbolName(this._target.key);
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
     * @throws {ReflectionError}
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
     * @returns {*}
     */
    public newInstanceArgs(dependencies: any[]): any {
        return new this._target(...dependencies);
    }

}

export default ReflectionClass;
