import ClassParser from '@src/Parsing/Parsers/ClassParser';
import ESTreeGenerator from '@src/Parsing/ESTreeGenerator';
import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';
import ParsingError from '@src/Parsing/Parsers/ParsingError';
import {PARAM_TYPES} from '@src/Constants/metadata';

/**
 * Decorator error.
 *
 * @throws {Error}
 */
const throwError = (): void => {
    throw new Error(
        'Cannot apply @injectable decorator to the same target multiple times.'
    );
};

/**
 * Check if the custom metadata is not already defined.
 *
 * @param {mixed} target
 * @param {string|undefined} propertyName
 * @returns {void}
 */
const checkMetadataIsNotDefined = (target: any, propertyName?: string): void => {
    if (!propertyName) {
        if (Reflect.hasOwnMetadata(PARAM_TYPES, target)) throwError();

        return;
    }

    if (Reflect.hasOwnMetadata(PARAM_TYPES, target, propertyName)) {
        throwError();
    }
};

/**
 * Parse a class declaration.
 *
 * @param {Object} tree
 * @param {mixed} target
 * @param {string|undefined} name
 * @returns {Array|undefined}
 */
const parseClass = (tree: any, target: any, name?: string):
    ParameterDescriptor[] | undefined => {
    const parser = new ClassParser(tree.body[0], target);

    if (name) {
        return parser.getMethodParameters(name);
    }

    return parser.getConstructorParameters();
};

/**
 * Get the constructor or function parameters.
 *
 * @param {Object} tree
 * @param {mixed} target
 * @param {string|undefined} method
 * @returns {Array|undefined}
 */
const getParameters = (tree: any, target: any, method?: string):
    ParameterDescriptor[] | undefined => {
    switch (tree.body[0].type) {
        case 'ClassDeclaration':
            return parseClass(tree, target, method);
        default:
            throw new ParsingError('Invalid ESTree structure provided.');
    }
};

/**
 * Define our custom meta data for dependency injection purposes in class
 * constructors.
 *
 * @param {Array} parameters
 * @param {mixed} target
 * @param {string|undefined} propertyName
 * @returns {void}
 */
const defineMetadata = (parameters: ParameterDescriptor[] | undefined,
    target: any, propertyName?: string): void => {
    if (propertyName) {
        Reflect.defineMetadata(PARAM_TYPES, parameters, target, propertyName);

        return;
    }

    Reflect.defineMetadata(PARAM_TYPES, parameters, target);
};

/**
 * Get the constructor of the given target.
 *
 * @param {mixed} target
 * @param {string} propertyName
 * @returns {boolean}
 */
const getConstructor = (target: any, propertyName?: string): any => {
    if (propertyName
        && Reflect.getOwnPropertyDescriptor(target.constructor.prototype, propertyName)) {
        return target.constructor;
    }

    return target;
};

export default (): Function => (target: any, propertyName?: string): void => {
    checkMetadataIsNotDefined(target, propertyName);

    const tree = ESTreeGenerator.generate(
        getConstructor(target, propertyName).toString()
    );

    defineMetadata(
        getParameters(tree, target, propertyName), target, propertyName
    );

    return target;
};
