import ReflectionParameter from '@src/Reflection/ReflectionParameter';

interface IReflectionFunction<T> {

    /**
     * Get the name of the reflected function.
     *
     * @returns {string|undefined}
     */
    getName(): string | undefined;

    /**
     * Get the parameters of the reflected function.
     *
     * @returns {Array}
     */
    getParameters(): ReflectionParameter<T, unknown>[];

}

export default IReflectionFunction;
