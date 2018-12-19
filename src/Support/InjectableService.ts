import ClassParser from '../Parsing/Parsers/ClassParser';
import ESTreeGenerator from '../Parsing/ESTreeGenerator';
import ParameterDescriptor from '../Descriptors/ParameterDescriptor';
import ParsingError from '../Parsing/Parsers/ParsingError';
import {isNullOrUndefined} from './helpers';
import {PARAM_TYPES} from '../Constants/metadata';

class InjectableService {

    /**
     * Define our custom meta data for dependency injection purposes in class
     * constructors.
     *
     * @param {mixed} target
     * @param {string|undefined} propertyName
     * @returns {void}
     */
    public static defineMetadata(target: any, propertyName?: string): void {
        InjectableService._avoidMultipleDefinition(target, propertyName);

        const tree = ESTreeGenerator.generate(
            InjectableService._getConstructor(target, propertyName).toString()
        );

        InjectableService._defineMetadata(
            InjectableService._getParameters(tree, target, propertyName),
            target,
            propertyName
        );
    }

    /**
     * Check if the custom metadata is not already defined.
     *
     * @param {mixed} target
     * @param {string|undefined} propertyName
     * @returns {void}
     */
    private static _avoidMultipleDefinition(target: any, propertyName?: string): void {
        if (isNullOrUndefined(propertyName)) {
            if (Reflect.hasOwnMetadata(PARAM_TYPES, target)) {
                InjectableService._throwError();
            }

            return;
        }

        if (Reflect.hasOwnMetadata(PARAM_TYPES, target, propertyName)) {
            InjectableService._throwError();
        }
    }

    /**
     * Decorator error.
     *
     * @throws {Error}
     */
    private static _throwError(): void {
        throw new Error(
            'Cannot apply @injectable decorator to the same target multiple times.'
        );
    }

    /**
     * Get the constructor of the given target.
     *
     * @param {mixed} target
     * @param {string|undefined} propertyName
     * @returns {mixed}
     */
    private static _getConstructor(target: any, propertyName?: string): any {
        if (!isNullOrUndefined(propertyName)
            && Reflect.getOwnPropertyDescriptor(target.constructor.prototype, propertyName)) {
            return target.constructor;
        }

        return target;
    }

    /**
     * Define our custom meta data for dependency injection purposes in class
     * constructors.
     *
     * @param {Array} parameters
     * @param {mixed} target
     * @param {string|undefined} propertyName
     * @returns {void}
     */
    private static _defineMetadata(parameters: ParameterDescriptor[] | undefined,
        target: any, propertyName?: string): void {
        if (isNullOrUndefined(propertyName)) {
            Reflect.defineMetadata(PARAM_TYPES, parameters, target);

            return;
        }

        Reflect.defineMetadata(PARAM_TYPES, parameters, target, propertyName);
    }

    /**
     * Get the constructor or function parameters.
     *
     * @param {Object} tree
     * @param {mixed} target
     * @param {string|undefined} method
     * @returns {Array|undefined}
     */
    private static _getParameters(tree: any, target: any, method?: string):
        ParameterDescriptor[] | undefined {
        switch (tree.body[0].type) {
            case 'ClassDeclaration':
                return InjectableService._parseClass(tree, target, method);
            default:
                throw new ParsingError('Invalid ESTree structure provided.');
        }
    }

    /**
     * Parse a class declaration.
     *
     * @param {Object} tree
     * @param {mixed} target
     * @param {string|undefined} name
     * @returns {Array|undefined}
     */
    private static _parseClass(tree: any, target: any, name?: string):
        ParameterDescriptor[] | undefined {
        const parser = new ClassParser(tree.body[0], target);

        if (name) {
            return parser.getMethodParameters(name);
        }

        return parser.getConstructorParameters();
    }

}

export default InjectableService;
