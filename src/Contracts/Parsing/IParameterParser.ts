import ParameterDescriptor from '../../Descriptors/ParameterDescriptor';

interface IParameterParser {

    /**
     * Get all the parsed parameters.
     *
     * @returns {Array}
     */
    all(): ParameterDescriptor<any>[];

    /**
     * Get the parsed parameter at the given index.
     *
     * @param {number} index
     * @returns {ParameterDescriptor}
     */
    at(index: number): ParameterDescriptor<any>;

}

export default IParameterParser;
