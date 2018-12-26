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
     * @param {*} target
     * @returns {(IFunctionAnalyser|undefined)}
     */
    getConstructorAnalyser(target: any): IFunctionAnalyser | undefined;

    /**
     * Get the method analyser
     *
     * @param {*} target
     * @param {string} name
     * @returns {(IFunctionAnalyser|undefined)}
     */
    getMethodAnalyser(target: any, name: string): IFunctionAnalyser | undefined;

    /**
     * Get the constructor parameter.
     *
     * @param {*} target
     * @returns {(ParameterDescriptor[]|undefined)}
     */
    getConstructorParameters(target: any): ParameterDescriptor[] | undefined;

    /**
     * Get the given method parameters.
     *
     * @param {*} target
     * @param {string} name
     * @returns {(ParameterDescriptor[]|undefined)}
     */
    getMethodParameters(target: any, name: string): ParameterDescriptor[] | undefined;

}

export default IClassAnalyser;
