import IFunctionAnalyser from './IFunctionAnalyser';
import ParameterDescriptor from '../../Descriptors/ParameterDescriptor';

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
     * @returns {(IFunctionAnalyser|undefined)}
     */
    getConstructorAnalyser(): IFunctionAnalyser | undefined;

    /**
     * Get the method analyser
     *
     * @param {string} name
     * @returns {(IFunctionAnalyser|undefined)}
     */
    getMethodAnalyser(name: string): IFunctionAnalyser | undefined;

    /**
     * Get the constructor parameter.
     *
     * @returns {(ParameterDescriptor[]|undefined)}
     */
    getConstructorParameters(): ParameterDescriptor[] | undefined;

    /**
     * Get the given method parameters.
     *
     * @param {string} name
     * @returns {(ParameterDescriptor[]|undefined)}
     */
    getMethodParameters(name: string): ParameterDescriptor[] | undefined;

}

export default IClassAnalyser;
