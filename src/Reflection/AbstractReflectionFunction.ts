import 'reflect-metadata';

import IReflectionFunction from '@src/Contracts/Reflection/IReflectionFunction';
import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import {ReflectionParameter} from '.';

abstract class AbstractReflectionFunction<T> implements IReflectionFunction<T> {

    /**
     * The target the function belongs to.
     *
     * @var {Function}
     */
    protected _target: T;

    /**
     * The name of the method.
     *
     * @var {string|undefined}
     */
    protected _name?: string;

    /**
     * Create a new abstract reflection function instance.
     *
     * @param {mixed} target
     * @param {string} name
     */
    public constructor(target: T, name?: string) {
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
    public getParameters(types?: ParameterDescriptor<unknown>[]): ReflectionParameter<T, unknown>[] {
        if (types) {
            return types
                .map((param: ParameterDescriptor<unknown>): ReflectionParameter<T, unknown> => (
                    new ReflectionParameter(this._target, param)
                ));
        }

        return [];
    }

}

export default AbstractReflectionFunction;
