import AbstractParameterAnalyser from '../AbstractParameterAnalyser';
import ParameterAnalyserContract from '../../../Contracts/Parsing/ParameterAnalyser';

class ParameterAnalyser extends AbstractParameterAnalyser implements ParameterAnalyserContract {

    /**
     * Find the assignment expression for the given parameter (if it exists).
     *
     * @param {Object} param
     * @returns {(Object|undefined)}
     */
    protected _findAssignment(param: any): any {
        if (param.type === 'AssignmentPattern') {
            return param;
        }
    }

}

export default ParameterAnalyser;
