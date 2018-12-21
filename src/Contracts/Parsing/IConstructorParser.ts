import IParameterParser from './IParameterParser';

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
     * @returns {?IParameterParser}
     */
    getParameters(): IParameterParser | undefined;

}

export default IConstructorParser;
