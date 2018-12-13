import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';

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
    getParameters(): ParameterDescriptor<unknown>[];

}

export default IConstructorParser;
