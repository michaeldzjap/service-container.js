import IParameterAnalyser from '../../../Contracts/Parsing/IParameterAnalyser';
import AbstractParameterAnalyser from '../AbstractParameterAnalyser';

class ParameterAnalyser extends AbstractParameterAnalyser implements IParameterAnalyser {

    /**
     * Find the assignment expression for the given parameter (if it exists).
     *
     * @param {Object} param
     * @returns {?Object}
     */
    protected _findAssignment(param: any): any {
        if (param.type === 'AssignmentPattern') {
            return param;
        }
    }

}

export default ParameterAnalyser;
