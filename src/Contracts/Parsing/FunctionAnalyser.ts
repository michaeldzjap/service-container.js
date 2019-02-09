import ParameterAnalyser from './ParameterAnalyser';

interface FunctionAnalyser {

    /**
     * Determine if the function has any parameters.
     *
     * @returns {boolean}
     */
    hasParameters(): boolean;

    /**
     * Determine if the function has a body.
     *
     * @returns {boolean}
     */
    hasBody(): boolean;

    /**
     * Get the parameter analyser instance.
     *
     * @returns {(ParameterAnalyser|undefined)}
     */
    getParameterAnalyser(): ParameterAnalyser | undefined;

}

export default FunctionAnalyser;
