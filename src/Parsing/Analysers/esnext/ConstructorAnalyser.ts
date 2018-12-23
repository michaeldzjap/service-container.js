import AbstractMethodAnalyser from './AbstractMethodAnalyser';
import ParsingError from '../../ParsingError';
import {isUndefined} from '../../../Support/helpers';

class ConstructorAnalyser extends AbstractMethodAnalyser {

    /**
     * Create a new constructor analyser instance.
     *
     * @param {Object} ast
     * @param {mixed} target
     */
    public constructor(ast: any, target: any) {
        if (!isUndefined(ast) && ast.type !== 'MethodDefinition'
            && ast.kind !== 'constructor') {
            throw new ParsingError('Invalid AST provided.');
        }

        super(ast, target);
    }

}

export default ConstructorAnalyser;
