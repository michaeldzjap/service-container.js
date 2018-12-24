import IReflectionFunction from '../Contracts/Reflection/IReflectionFunction';
import ParameterDescriptor from '../Descriptors/ParameterDescriptor';
import ReflectionParameter from './ReflectionParameter';

abstract class AbstractReflectionFunction implements IReflectionFunction {

    /**
     * The target the function belongs to.
     *
     * @var {*}
     */
    protected _target: any;

    /**
     * The name of the function.
     *
     * @var {(string|undefined)}
     */
    protected _name?: string;

    /**
     * Create a new abstract reflection function instance.
     *
     * @param {*} target
     * @param {string} name
     */
    public constructor(target: any, name?: string) {
        this._target = target;
        this._name = name;
    }

    /**
     * Get the name of the reflected function.
     *
     * @returns {(string|undefined)}
     */
    public getName(): string | undefined {
        return this._name;
    }

    /**
     * Get the parameters of the reflected function.
     *
     * @param {ParameterDescriptor[]} types
     * @returns {ReflectionParameter[]}
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
