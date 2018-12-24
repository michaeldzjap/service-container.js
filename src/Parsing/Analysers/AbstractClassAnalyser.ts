import IFunctionAnalyser from '../../Contracts/Parsing/IFunctionAnalyser';
import ParameterDescriptor from '../../Descriptors/ParameterDescriptor';
import {isUndefined} from '../../Support/helpers';

abstract class AbstractClassAnalyser {

    /**
     * Get the constructor analyser.
     *
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public abstract getConstructorAnalyser(): IFunctionAnalyser | undefined;

    /**
     * Get the method analyser
     *
     * @param {string} name
     * @returns {(IFunctionAnalyser|undefined)}
     */
    public abstract getMethodAnalyser(name: string): IFunctionAnalyser | undefined;

    /**
     * Get the constructor parameter.
     *
     * @returns {(ParameterDescriptor[]|undefined)}
     */
    public getConstructorParameters(): ParameterDescriptor[] | undefined {
        const constructorAnalyser = this.getConstructorAnalyser();

        if (isUndefined(constructorAnalyser)) return;

        const parameterAnalyser = constructorAnalyser.getParameterAnalyser();

        if (isUndefined(parameterAnalyser)) return;

        return parameterAnalyser.all();
    }

    /**
     * Get the given method parameters.
     *
     * @param {string} name
     * @returns {(ParameterDescriptor[]|undefined)}
     */
    public getMethodParameters(name: string): ParameterDescriptor[] | undefined {
        const methodAnalyser = this.getMethodAnalyser(name);

        if (isUndefined(methodAnalyser)) return;

        const parameterAnalyser = methodAnalyser.getParameterAnalyser();

        if (isUndefined(parameterAnalyser)) return;

        return parameterAnalyser.all();
    }

}

export default AbstractClassAnalyser;
