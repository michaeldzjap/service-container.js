import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';

interface IClassParser {

    /**
     * Check if the class has a body.
     *
     * @returns {boolean}
     */
    hasConstructor(): boolean;

    /**
     * Get the parameters of the class constructor.
     *
     * @returns {Array|undefined}
     */
    getConstructorParameters(): ParameterDescriptor<any>[] | undefined;

}

export default IClassParser;
