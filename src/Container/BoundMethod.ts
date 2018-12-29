import Callable from './Callable';
import Container from './Container';
import ReflectionMethod from '../Reflection/ReflectionMethod';
import ReflectionParameter from '../Reflection/ReflectionParameter';
import {Identifier, Instantiable} from '../Support/types';
import {isNullOrUndefined, isInstance, isInstantiable} from '../Support/helpers';

class BoundMethod {

    /**
     * Call the given Closure / class@method and inject its dependencies.
     *
     * @param {Container} container
     * @param {Callable} callback
     * @param {(Array|Object|undefined)} parameters
     * @param {(string|undefined)} defaultMethod
     * @returns {*}
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
     * @param {(Array|Object|undefined)} parameters
     * @param {(string|undefined)} defaultMethod
     * @returns {*}
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
     * @returns {*}
     */
    protected static _callBoundMethod<T>(container: Container, callback: Callable<T>, dflt: Function): unknown {
        // Here we need to turn the array callable into a Class@method string we
        // can use to examine the container and see if there are any method
        // bindings for this given method. If there are, we can call this method
        // binding callback immediately.
        const method = BoundMethod._normalizeMethod<T>(callback);

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
        const className = isInstantiable(callback.target)
            ? callback.target.name
            : callback.target.constructor.name;

        return `${className}@${callback.method}`;
    }

    /**
     * Get all dependencies for a given method.
     *
     * @param {Container} container
     * @param {Callable} callback
     * @param {(Array|Object)} parameters
     * @returns {Array}
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

        for (const parameter of BoundMethod._getCallReflector<T>(callback).getParameters()) {
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
        parameter: ReflectionParameter, parameters: object, dependencies: object): void {
        if (parameters.hasOwnProperty(parameter.getName())) {
            dependencies[parameter.getName()] = parameters[parameter.getName()];

            delete parameters[parameter.getName()];
        } else if (parameter.getClass() && parameters.hasOwnProperty(parameter.getClass()!.getName())) {
            dependencies[parameter.getClass()!.getName()] = parameters[parameter.getClass()!.getName()];

            delete parameters[parameter.getClass()!.getName()];
        } else if (parameter.getClass()) {
            dependencies[parameter.getClass()!.getName()] = container.make(
                parameter.getClass()!.getTarget()
            );
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
    protected static _getCallReflector<T>(callback: Callable<T>): ReflectionMethod {
        if (isNullOrUndefined(callback.method)) {
            throw new Error('Method name is missing.');
        }

        return new ReflectionMethod(
            BoundMethod._getClassDefinition(callback),
            callback.method
        );
    }

    /**
     * Return the class definition of the callable target.
     *
     * @param {Callable} callback
     * @returns {Instantiable}
     */
    private static _getClassDefinition<T>(callback: Callable<T>): Instantiable<T> {
        const target = callback.isStatic || isInstantiable(callback.target)
            ? callback.target
            : callback.target.constructor;

        return target as Instantiable<T>;
    }

    /**
     * Determine if the given callback is a reference to a non-static method of
     * a class definition or an instance.
     *
     * @param {Callable} callback
     * @returns {boolean}
     */
    private static _isCallable<T>(callback: Callable<T>): boolean {
        return (isInstantiable(callback.target) || isInstance(callback.target))
         && !callback.isStatic;
    }

}

export default BoundMethod;
