import ReflectionParameter from '../../Reflection/ReflectionParameter';

interface IReflectionFunction {

    /**
     * Get the name of the reflected function.
     *
     * @returns {(string|undefined)}
     */
    getName(): string | undefined;

    /**
     * Get the parameters of the reflected function.
     *
     * @returns {ReflectionParameter[]}
     */
    getParameters(): ReflectionParameter[];

}

export default IReflectionFunction;
