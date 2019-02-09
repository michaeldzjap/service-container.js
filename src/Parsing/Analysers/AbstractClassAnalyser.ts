import FunctionAnalyser from '../../Contracts/Parsing/FunctionAnalyser';
import ParameterDescriptor from '../../Descriptors/ParameterDescriptor';
import {isUndefined} from '../../Support/helpers';

abstract class AbstractClassAnalyser {

    /**
     * Get the constructor analyser.
     *
     * @param {*} target
     * @returns {(FunctionAnalyser|undefined)}
     */
    public abstract getConstructorAnalyser(target: any): FunctionAnalyser | undefined;

    /**
     * Get the method analyser
     *
     * @param {*} target
     * @param {string} name
     * @returns {(FunctionAnalyser|undefined)}
     */
    public abstract getMethodAnalyser(target: any, name: string): FunctionAnalyser | undefined;

    /**
     * Get the constructor parameter.
     *
     * @param {*} target
     * @returns {(ParameterDescriptor[]|undefined)}
     */
    public getConstructorParameters(target: any): ParameterDescriptor[] | undefined {
        const constructorAnalyser = this.getConstructorAnalyser(target);

        if (isUndefined(constructorAnalyser)) return;

        const parameterAnalyser = constructorAnalyser.getParameterAnalyser();

        if (isUndefined(parameterAnalyser)) return;

        return parameterAnalyser.all();
    }

    /**
     * Get the given method parameters.
     *
     * @param {*} target
     * @param {string} name
     * @returns {(ParameterDescriptor[]|undefined)}
     */
    public getMethodParameters(target: any, name: string): ParameterDescriptor[] | undefined {
        const methodAnalyser = this.getMethodAnalyser(target, name);

        if (isUndefined(methodAnalyser)) return;

        const parameterAnalyser = methodAnalyser.getParameterAnalyser();

        if (isUndefined(parameterAnalyser)) return;

        return parameterAnalyser.all();
    }

}

export default AbstractClassAnalyser;
