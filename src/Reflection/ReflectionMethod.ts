import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import {
    AbstractReflectionFunction,
    ReflectionClass,
    ReflectionParameter
} from '.';
import {PARAM_TYPES} from '@src/Constants/metadata';

class ReflectionMethod<T> extends AbstractReflectionFunction<T> {

    /**
     * The method descriptor object.
     *
     * @var {PropertyDescriptor}
     */
    private _descriptor?: PropertyDescriptor;

    /**
     * Create a new reflection method instance.
     *
     * @param {mixed} target
     * @param {string} name
     */
    public constructor(target: T, name: string) {
        super(target, name);

        const descriptor = ReflectionMethod._findDescriptor<T>(target, name);

        this._descriptor = descriptor;
    }

    /**
     * Find the method descriptor object.
     *
     * @param {Function} target
     * @param {string} name
     * @returns {Object}
     *
     * @throws {ReferenceError}
     */
    private static _findDescriptor<T>(target: T, name: string): PropertyDescriptor | undefined {
        if (Reflect.has((target as unknown as Function).prototype as any, name)) {
            // Regular method
            return Reflect.getOwnPropertyDescriptor(
                (target as unknown as Function).prototype as any,
                name
            );
        }

        if (Reflect.has(target as unknown as object, name)) {
            // Static method
            return Reflect.getOwnPropertyDescriptor(
                target as unknown as object,
                name
            );
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
    public getDeclaringClass(): ReflectionClass<T> {
        return new ReflectionClass<T>(this._target);
    }

    /**
     * Get the parameters of the reflected function.
     *
     * @returns {Array}
     */
    public getParameters(): ReflectionParameter<T, unknown>[] {
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

        return !!Reflect.getOwnPropertyDescriptor(
            this._target as unknown as object,
            this._name
        );
    }

    /**
     * Get the parameter types of the reflected method.
     *
     * @returns {ParameterDescriptor|undefined}
     */
    private _getTypes(): ParameterDescriptor<unknown>[] | undefined {
        if (this.isConstructor()) {
            return Reflect.getMetadata(PARAM_TYPES, this._target);
        }

        if (this.isStatic()) {
            return Reflect.getMetadata(PARAM_TYPES, this._target, this._name as string);
        }

        return Reflect.getMetadata(
            PARAM_TYPES, (this._target as any).prototype, this._name as string
        );
    }

}

export default ReflectionMethod;
