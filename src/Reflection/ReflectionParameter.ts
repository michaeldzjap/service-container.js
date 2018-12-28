import ParameterDescriptor from '../Descriptors/ParameterDescriptor';
import ReflectionClass from './ReflectionClass';
import ReflectionType from './ReflectionType';
import {isUndefined, isInstantiable} from '../Support/helpers';

class ReflectionParameter {

    /**
     * The target the parameter belongs to.
     *
     * @var {*}
     */
    private _target: any;

    /**
     * The type of the reflected parameter.
     *
     * @var {*}
     */
    private _descriptor: ParameterDescriptor;

    /**
     * Create a new reflection parameter instance.
     *
     * @param {*} target
     * @param {ParameterDescriptor} descriptor
     * @param {number} position
     */
    public constructor(target: any, descriptor: ParameterDescriptor) {
        this._target = target;
        this._descriptor = descriptor;
    }

    /**
     * Get the class definition for the reflected parameter (if it exists).
     *
     * @returns {(ReflectionClass|undefined)}
     */
    public getDeclaringClass(): ReflectionClass | undefined {
        if (isInstantiable(this._target)) {
            return new ReflectionClass(this._target);
        }
    }

    /**
     * Get the class type hinted for the reflected parameter.
     *
     * @returns {(ReflectionClass|undefined)}
     */
    public getClass(): ReflectionClass | undefined {
        if (this.getType().isBuiltin()) return;

        if (this._descriptor.type.name === 'Interface') {
            return ReflectionClass.createFromInterface(this._descriptor.type);
        }

        return new ReflectionClass(this._descriptor.type);
    }

    /**
     * Get the name of the reflected parameter.
     *
     * @returns {string}
     */
    public getName(): string {
        return this._descriptor.name;
    }

    /**
     * Get the type of the reflected parameter.
     *
     * @returns {ReflectionType}
     */
    public getType(): ReflectionType {
        return new ReflectionType(this._descriptor.type);
    }

    /**
     * Get the position of the reflected parameter.
     *
     * @returns {number}
     */
    public getPosition(): number {
        return this._descriptor.position;
    }

    /**
     * Check if the reflected parameter has a default value.
     *
     * @returns {boolean}
     */
    public isDefaultValueAvailable(): boolean {
        return !isUndefined(this._descriptor.value);
    }

    /**
     * Get the default value of the reflected parameter.
     *
     * @returns {*}
     */
    public getDefaultValue(): unknown {
        return this._descriptor.value;
    }

}

export default ReflectionParameter;
