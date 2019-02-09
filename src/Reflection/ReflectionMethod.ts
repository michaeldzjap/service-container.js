import AbstractReflectionFunction from './AbstractReflectionFunction';
import ParameterDescriptor from '../Descriptors/ParameterDescriptor';
import ReflectionClass from './ReflectionClass';
import ReflectionParameter from './ReflectionParameter';
import {isNullOrUndefined} from '../Support/helpers';
import {PARAM_TYPES} from '../constants/metadata';

class ReflectionMethod extends AbstractReflectionFunction {

    /**
     * The method descriptor object.
     *
     * @var {(PropertyDescriptor|undefined)}
     */
    private _descriptor?: PropertyDescriptor;

    /**
     * Create a new reflection method instance.
     *
     * @constructor
     * @param {*} target
     * @param {string} name
     */
    public constructor(target: any, name: string) {
        super(target, name);

        const descriptor = ReflectionMethod._findDescriptor(target, name);

        this._descriptor = descriptor;
    }

    /**
     * Find the method descriptor object.
     *
     * @param {*} target
     * @param {string} name
     * @returns {Object}
     *
     * @throws {ReferenceError}
     */
    private static _findDescriptor(target: any, name: string): PropertyDescriptor | undefined {
        if (Reflect.has(target.prototype, name)) {
            // Regular method
            return Reflect.getOwnPropertyDescriptor(target.prototype, name);
        }

        if (Reflect.has(target, name)) {
            // Static method
            return Reflect.getOwnPropertyDescriptor(target, name);
        }

        throw new ReferenceError(
            `The method [${name}] does not exist on the reflected class.`
        );
    }

    /**
     * Get the class definition for the reflected method.
     *
     * @returns {ReflectionClass}
     */
    public getDeclaringClass(): ReflectionClass {
        return new ReflectionClass(this._target);
    }

    /**
     * Get the parameters of the reflected function.
     *
     * @returns {Array}
     */
    public getParameters(): ReflectionParameter[] {
        return super.getParameters(this._getTypes());
    }

    /**
     * Check if the reflected method is a constructor.
     *
     * @returns {boolean}
     */
    public isConstructor(): boolean {
        if (this._name === 'constructor') return true;

        if (!this._descriptor || this._descriptor.set) {
            return false;
        }

        try {
            // This will throw an error for a constructor, since it has to be
            // prepended with the "new" keyword
            this._descriptor.value();
        } catch (error) {
            return true;
        }

        return false;
    }

    /**
     * Check if the reflected method is static.
     *
     * @returns {boolean}
     */
    public isStatic(): boolean {
        if (!this._name || this._name === 'constructor') return false;

        return !!Reflect.getOwnPropertyDescriptor(this._target, this._name);
    }

    /**
     * Get the parameter types of the reflected method.
     *
     * @returns {?ParameterDescriptor}
     *
     * @throws {Error}
     */
    private _getTypes(): ParameterDescriptor[] | undefined {
        if (this.isConstructor()) {
            return Reflect.getMetadata(PARAM_TYPES, this._target);
        }

        if (isNullOrUndefined(this._name)) {
            throw new Error('Method name is missing.');
        }

        if (this.isStatic()) {
            return Reflect.getMetadata(PARAM_TYPES, this._target, this._name);
        }

        return Reflect.getMetadata(
            PARAM_TYPES, this._target.prototype, this._name
        );
    }

}

export default ReflectionMethod;
