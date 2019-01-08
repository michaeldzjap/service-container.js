import AbstractMethodAnalyser from './AbstractMethodAnalyser';
import ParsingError from '../../ParsingError';

class ConstructorAnalyser extends AbstractMethodAnalyser {

    /**
     * Create a new constructor analyser instance.
     *
     * @constructor
     * @param {Object} ast
     * @param {*} target
     */
    public constructor(ast: any, target: any) {
        if (ast.type !== 'MethodDefinition' && ast.kind !== 'constructor') {
            throw new ParsingError('Invalid AST provided.');
        }

        super(ast, target);
    }

}

export default ConstructorAnalyser;
