import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';

interface IParameterParser {

    /**
     * Get all the parsed parameters.
     *
     * @returns {Array}
     */
    all(): ParameterDescriptor<unknown>[];

    /**
     * Get the parsed parameter at the given index.
     *
     * @param {number} index
     * @returns {ParameterDescriptor}
     */
    at(index: number): ParameterDescriptor<unknown>;

}

export default IParameterParser;
