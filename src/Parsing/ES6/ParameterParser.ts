import IParameterParser from '../../Contracts/Parsing/IParameterParser';
import ParameterParserBase from '../ParameterParserBase';

class ParameterParser extends ParameterParserBase implements IParameterParser {

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

export default ParameterParser;
