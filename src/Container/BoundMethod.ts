import Callable from './Callable';
import Container from './Container';
import {ReflectionMethod, ReflectionParameter} from '@src/Reflection';
import {Identifier} from '@typings/.';
import {isNullOrUndefined} from '@src/Support/helpers';

class BoundMethod {

    /**
     * Call the given Closure / class@method and inject its dependencies.
     *
     * @param {Container} container
     * @param {Callable} callback
     * @param {Array|Object|undefined} parameters
     * @param {string|undefined} defaultMethod
     * @returns {mixed}
     */
    public static call<T>(container: Container, callback: Callable<T>,
        parameters?: any[] | object, defaultMethod?: string): any {
        if (BoundMethod._isCallable<T>(callback) || defaultMethod) {
            return BoundMethod._callClass<T>(
                container, callback, parameters, defaultMethod
            );
        }

        return BoundMethod._callBoundMethod(container, callback, (): any => (
            callback.call(
                BoundMethod._getMethodDependencies(container, callback, parameters)
            )
        ));
    }

    /**
     * Call a string reference to a class using Class@method syntax.
     *
     * @param {Container} container
     * @param {Callable} target
     * @param {Array|Object|undefined} parameters
     * @param {string|undefined} defaultMethod
     * @returns {mixed}
     *
     * @throws {Error}
     */
    protected static _callClass<T>(container: Container, target: Callable<T>,
        parameters?: any[] | object, defaultMethod?: string): any {
        // Build a callable object that we can pass right back into the "call"
        // method for dependency binding.
        const method = target.method || defaultMethod;

        if (isNullOrUndefined(method)) {
            throw new Error('Method not provided.');
        }

        return BoundMethod.call<T>(
            container,
            new Callable(
                container.make<T>(target.target as unknown as Identifier<T>),
                method,
                target.isStatic
            ),
            parameters
        );
    }

    /**
     * Call a method that has been bound to the container.
     *
     * @param {Container} container
     * @param {Callable} callback
     * @param {Function} dflt
     * @returns {mixed}
     */
    protected static _callBoundMethod<T>(container: Container, callback: Callable<T>, dflt: Function): unknown {
        // Here we need to turn the array callable into a Class@method string we
        // can use to examine the container and see if there are any method
        // bindings for this given method. If there are, we can call this method
        // binding callback immediately.
        const method = BoundMethod._normalizeMethod(callback);

        if (container.hasMethodBinding(method)) {
            return container.callMethodBinding(method, callback.target);
        }

        return dflt();
    }

    /**
     * Normalize the given callback into a Class@method string.
     *
     * @param {Callable} callback
     * @returns {string}
     */
    protected static _normalizeMethod<T>(callback: Callable<T>): string {
        const className = callback.target.constructor.name;

        return `${className}@${callback.method}`;
    }

    /**
     * Get all dependencies for a given method.
     *
     * @param {Container} container
     * @param {Callable} callback
     * @param {Array|Object} parameters
     * @returns {Object}
     */
    protected static _getMethodDependencies<T>(container: Container, callback: Callable<T>,
        parameters: any[] | object = {}): Array<any> {
        const dependencies = {};

        if (Array.isArray(parameters)) {
            parameters = parameters.reduce((acc: any, parameter: any, index: number): any => {
                acc[index] = parameter;

                return acc;
            }, {});
        }

        for (const parameter of BoundMethod._getCallReflector(callback).getParameters()) {
            BoundMethod._addDependencyForCallParameter(
                container, parameter, parameters, dependencies
            );
        }

        return (Object as any).values({...dependencies, ...parameters});
    }

    /**
     * Get the dependency for the given call parameter.
     *
     * @param {Container} container
     * @param {ReflectionParameter} parameter
     * @param {Object} parameters
     * @param {Object} dependencies
     * @returns {void}
     */
    protected static _addDependencyForCallParameter(container: Container,
        parameter: ReflectionParameter<any, any>, parameters: object, dependencies: object): void {
        if (parameters.hasOwnProperty(parameter.getName())) {
            dependencies[parameter.getName()] = parameters[parameter.getName()];

            delete parameters[parameter.getName()];
        } else if (parameter.getClass() && parameters.hasOwnProperty(parameter.getClass()!.getTarget())) {
            dependencies[parameter.getClass()!.getTarget()] = parameters[parameter.getClass()!.getTarget()];

            delete parameters[parameter.getClass()!.getTarget()];
        } else if (parameter.getClass()) {
            dependencies[parameter.getClass()!.getTarget()] = container.make(parameter.getClass()!.getTarget());
        } else if (parameter.isDefaultValueAvailable()) {
            dependencies[parameter.getName()] = parameter.getDefaultValue();
        }
    }

    /**
     * Get the proper reflection instance for the given callback.
     *
     * @param {Callable} callback
     * @returns {ReflectionMethod}
     */
    protected static _getCallReflector<T>(callback: Callable<T>): ReflectionMethod<T> {
        return new ReflectionMethod<T>(
            callback.target.constructor as any,
            callback.method as string
        );
    }

    /**
     * Determine if the given callback is a class definition or an instance.
     *
     * @param {mixed} callback
     * @returns {boolean}
     */
    private static _isCallable<T>(callback: Callable<T>): boolean {
        return !!(callback.target as any).prototype;
    }

}

export default BoundMethod;
