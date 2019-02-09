import ParameterDescriptor from '../Descriptors/ParameterDescriptor';
import ClassAnalyserManager from '../Parsing/Analysers/ClassAnalyserManager';
import ParserManager from '../Parsing/ParserManager';
import {isUndefined} from './helpers';
import {PARAM_TYPES} from '../constants/metadata';

class InjectableService {

    /**
     * The ast cache.
     *
     * @var {Map}
     */
    private static _ast: Map<any, any> = new Map;

    /**
     * Define our custom meta data for dependency injection purposes in class
     * constructors.
     *
     * @param {*} target
     * @param {(string|symbol|undefined)} propertyKey
     * @returns {void}
     */
    public static defineMetadata(target: any, propertyKey?: string | symbol): void {
        InjectableService._avoidMultipleDefinition(target, propertyKey);

        InjectableService._defineMetadata(
            InjectableService._getParameters(target, propertyKey),
            target,
            propertyKey
        );
    }

    /**
     * Check if the custom metadata is not already defined.
     *
     * @param {*} target
     * @param {(string|symbol|undefined)} propertyKey
     * @returns {void}
     */
    private static _avoidMultipleDefinition(target: any, propertyKey?: string | symbol): void {
        if (isUndefined(propertyKey)) {
            if (Reflect.hasOwnMetadata(PARAM_TYPES, target)) {
                InjectableService._throwError();
            }

            return;
        }

        if (Reflect.hasOwnMetadata(PARAM_TYPES, target, propertyKey)) {
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
     * Define our custom meta data for dependency injection purposes in class
     * constructors.
     *
     * @param {(ParameterDescriptor[]|undefined)} parameters
     * @param {*} target
     * @param {(string|symbol|undefined)} propertyKey
     * @returns {void}
     */
    private static _defineMetadata(parameters: ParameterDescriptor[] | undefined,
        target: any, propertyKey?: string | symbol): void {
        if (isUndefined(propertyKey)) {
            Reflect.defineMetadata(PARAM_TYPES, parameters, target);

            return;
        }

        Reflect.defineMetadata(PARAM_TYPES, parameters, target, propertyKey);
    }

    /**
     * Get the constructor or function parameters.
     *
     * @param {*} target
     * @param {(string|symbol|undefined)} propertyKey
     * @returns {(ParameterDescriptor[]|undefined)}
     */
    private static _getParameters(target: any, propertyKey?: string | symbol):
        ParameterDescriptor[] | undefined {
        const ast = InjectableService._getAst(target, propertyKey);
        const analyser = (new ClassAnalyserManager(ast.body[0])).driver();

        if (isUndefined(propertyKey)) {
            return analyser.getConstructorParameters(target);
        }

        return analyser.getMethodParameters(target, propertyKey);
    }

    /**
     * Get the AST for the given target. Use cached version if it exists, else
     * parse the class definition and store it in cache.
     *
     * @param {*} target
     * @param {(string|symbol|undefined)} propertyKey
     * @returns {Object}
     */
    private static _getAst(target: any, propertyKey?: string | symbol): any {
        const definition = InjectableService._getClassDefinition(target, propertyKey);

        if (!InjectableService._ast.has(definition)) {
            InjectableService._ast.set(
                definition, (new ParserManager).ast(definition)
            );
        }

        return InjectableService._ast.get(definition);
    }

    /**
     * Get the constructor of the given target.
     *
     * @param {*} target
     * @param {(string|symbol|undefined)} propertyKey
     * @returns {mixed}
     */
    private static _getClassDefinition(target: any, propertyKey?: string | symbol): any {
        if (!isUndefined(propertyKey)
            && Reflect.getOwnPropertyDescriptor(target.constructor.prototype, propertyKey)) {
            return target.constructor;
        }

        return target;
    }

}

export default InjectableService;
