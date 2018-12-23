import IParameterAnalyser from './IParameterAnalyser';

interface IConstructorAnalyser {

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
     * @returns {?IParameterAnalyser}
     */
    getParameterAnalyser(): IParameterAnalyser | undefined;

}

export default IConstructorAnalyser;
