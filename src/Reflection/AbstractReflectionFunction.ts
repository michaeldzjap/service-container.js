import 'reflect-metadata';

import IReflectionFunction from '@src/Contracts/Reflection/IReflectionFunction';
import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import {ReflectionParameter} from '.';

abstract class AbstractReflectionFunction implements IReflectionFunction {

    /**
     * The target the function belongs to.
     *
     * @var {Function}
     */
    protected _target: Function;

    /**
     * The name of the function.
     *
     * @var {string|undefined}
     */
    protected _name?: string;

    /**
     * Create a new abstract reflection function instance.
     *
     * @param {Function} target
     * @param {string} name
     */
    public constructor(target: Function, name?: string) {
        this._target = target;
        this._name = name;
    }

    /**
     * Get the name of the reflected function.
     *
     * @returns {string|undefined}
     */
    public getName(): string | undefined {
        return this._name;
    }

    /**
     * Get the parameters of the reflected function.
     *
     * @param {Array|undefined} types
     * @returns {Array}
     */
    public getParameters(types?: ParameterDescriptor[]): ReflectionParameter[] {
        if (types) {
            return types
                .map((param: ParameterDescriptor): ReflectionParameter => (
                    new ReflectionParameter(this._target, param)
                ));
        }

        return [];
    }

}

export default AbstractReflectionFunction;
