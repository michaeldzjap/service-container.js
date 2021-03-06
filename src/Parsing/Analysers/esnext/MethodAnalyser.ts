import AbstractMethodAnalyser from './AbstractMethodAnalyser';
import ParsingError from '../../ParsingError';
import {isUndefined} from '../../../Support/helpers';

class MethodAnalyser extends AbstractMethodAnalyser {

    /**
     * Create a new function analyser instance.
     *
     * @constructor
     * @param {Object} ast
     * @param {*} target
     */
    public constructor(ast: any, target: any) {
        if (!isUndefined(ast) && ast.type !== 'MethodDefinition') {
            throw new ParsingError('Invalid AST provided.');
        }

        super(ast, target);
    }

}

export default MethodAnalyser;
