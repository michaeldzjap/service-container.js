import IFunctionAnalyser from './IFunctionAnalyser';

interface IClassAnalyser {

    /**
     * Determine if the class has a constructor.
     *
     * @returns {boolean}
     */
    hasConstructor(): boolean;

    /**
     * Get the constructor analyser.
     *
     * @returns {?IFunctionAnalyser}
     */
    getConstructorAnalyser(): IFunctionAnalyser | undefined;

}

export default IClassAnalyser;
