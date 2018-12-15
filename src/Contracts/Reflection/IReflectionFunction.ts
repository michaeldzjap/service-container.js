import ReflectionParameter from '@src/Reflection/ReflectionParameter';

interface IReflectionFunction {

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
    getParameters(): ReflectionParameter[];

}

export default IReflectionFunction;
