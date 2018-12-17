import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';

interface IConstructorParser {

    /**
     * Check if the constructor has any parameters.
     *
     * @returns {boolean}
     */
    hasParameters(): boolean;

    /**
     * Get the constructor parameters.
     *
     * @returns {Array}
     */
    getParameters(): ParameterDescriptor<any>[];

}

export default IConstructorParser;
