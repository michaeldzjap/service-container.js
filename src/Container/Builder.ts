import BindingResolutionError from './BindingResolutionError';
import BuilderContract from '../Contracts/Container/Builder';
import Container from './Container';
import ReflectionClass from '../Reflection/ReflectionClass';
import ReflectionParameter from '../Reflection/ReflectionParameter';
import {last} from '../Support/Arr';
import {
    isUndefined, isInstantiable, isInstance, getSymbolName
} from '../Support/helpers';
import {Instantiable} from '../types/container';

class Builder implements BuilderContract {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * The stack of concretions currently being built.
     *
     * @var {Array}
     */
    protected _buildStack: any[] = [];

    /**
     * The parameter override stack.
     *
     * @var {(*|Object)[]}
     */
    protected _with: any | object[] = [];

    /**
     * Create a new class binding builder.
     *
     * @constructor
     * @param {Container} container
     */
    public constructor(container: Container) {
        this._container = container;
    }

    /**
     * Format the name of the given concrete.
     *
     * @param {*} concrete
     * @returns {string}
     */
    private static _formatName<T>(concrete: T): string {
        if (typeof concrete === 'symbol') {
            return getSymbolName(concrete);
        }

        if (isInstantiable(concrete)) {
            return concrete.name;
        }

        if (isInstance(concrete)) {
            return concrete.constructor.name;
        }

        return 'undefined';
    }

    /**
     * Instantiate a concrete instance of the given type.
     *
     * @param {(Identifier|Function)} concrete
     * @returns {*}
     */
    public build<T>(concrete: Instantiable<T> | Function): any {
        // If the concrete type is actually a Closure, we will just execute it
        // and hand back the results of the functions, which allows functions
        // to be used as resolvers for more fine-tuned resolution of these
        // objects.
        if (!isInstantiable(concrete) && concrete instanceof Function) {
            return concrete(this._container, this._getLastParameterOverride());
        }

        const reflector = typeof concrete === 'symbol'
            ? ReflectionClass.createFromInterface(concrete)
            : new ReflectionClass(concrete);

        // If the type is not instantiable, the developer is attempting to
        // resolve an abstract type such as an Interface of Abstract Class and
        // there is no binding registered for the abstractions so we need to
        // bail out.
        if (!reflector.isInstantiable()) {
            this._notInstantiable(concrete);
        }

        this._buildStack.push(concrete);

        const dependencies = reflector.getConstructor().getParameters();

        // If there are no constructor parameters, that means there are no
        // dependencies then we can just resolve the instances of the objects
        // right away, without resolving any other types or dependencies out of
        // these containers.
        if (!dependencies.length) {
            this._buildStack.pop();

            return new (concrete as any);
        }

        // Once we have all the constructor's parameters we can create each of
        // the dependency instances and then use the reflection instances to
        // make a new instance of this class, injecting the created dependencies
        // in.
        const instances = this._resolveDependencies(dependencies);

        this._buildStack.pop();

        return reflector.newInstanceArgs(instances);
    }

    /**
     * Push a parameter override on the stack.
     *
     * @param {Array|Object} parameters
     * @returns {void}
     */
    public pushParameterOverride(parameters: any[] | object): void {
        this._with.push(parameters);
    }

    /**
     * Pop a parameter override off the stack.
     *
     * @returns {void}
     */
    public popParameterOverride(): void {
        this._with.pop();
    }

    /**
     * Get the stack of concretions currently being built.
     *
     * @returns {Array}
     */
    public getLatestBuild(): any[] {
        return last(this._buildStack);
    }

    /**
     * Resolve all of the dependencies from the ReflectionParameters.
     *
     * @param {ReflectionParameter[]} dependencies
     * @returns {Array}
     */
    protected _resolveDependencies(dependencies: ReflectionParameter[]): any[] {
        const results = [];

        for (const dependency of dependencies) {
            // If this dependency has a override for this particular build we
            // will use that instead as the value. Otherwise, we will continue
            // with this run of resolutions and let reflection attempt to
            // determine the result.
            if (this._hasParameterOverride(dependency)) {
                results.push(this._getParameterOverride(dependency));

                continue;
            }

            // If the class is null, it means the dependency is a string or some
            // class and we will just bomb out with an error since we have
            // no-where to go.
            results.push(
                dependency.getType().isBuiltin()
                    ? this._resolvePrimitive(dependency)
                    : this._resolveClass(dependency)
            );
        }

        return results;
    }

    /**
     * Determine if the given dependency has a parameter override.
     *
     * @param {ReflectionParameter} dependency
     * @returns {boolean}
     */
    protected _hasParameterOverride(dependency: ReflectionParameter): boolean {
        const override = this._getLastParameterOverride();

        return Array.isArray(override)
            ? false
            : override.hasOwnProperty(dependency.getName());
    }

    /**
     * Get a parameter override for a dependency.
     *
     * @param {ReflectionParameter} dependency
     * @returns {*}
     */
    protected _getParameterOverride(dependency: ReflectionParameter): any {
        return this._getLastParameterOverride()[dependency.getName()];
    }

    /**
     * Get the last parameter override.
     *
     * @returns {(Array|Object)}
     */
    protected _getLastParameterOverride(): any[] | object {
        return this._with.length ? last(this._with) : [];
    }

    /**
     * Resolve a non-class hinted primitive dependency.
     *
     * @param {ReflectionParameter} parameter
     * @returns {(*|undefined)}
     */
    protected _resolvePrimitive(parameter: ReflectionParameter): any | undefined {
        const concrete = this._container
            .getContextualBinder()
            .getContextualConcrete(parameter.getName());

        if (concrete) {
            return concrete instanceof Function
                ? concrete(this._container)
                : concrete;
        }

        if (parameter.isDefaultValueAvailable()) {
            return parameter.getDefaultValue();
        }

        this._unresolvablePrimitive(parameter);
    }

    /**
     * Resolve a class based dependency from the container.
     *
     * @param {ReflectionParameter} parameter
     * @returns {*}
     *
     * @throws {BindingResolutionError}
     */
    protected _resolveClass(parameter: ReflectionParameter): any {
        const reflector = parameter.getClass();

        if (isUndefined(reflector)) {
            throw new BindingResolutionError('Cannot get parameter type.');
        }

        try {
            const target = reflector.getTarget();

            return this._container.make(reflector.isInterface() ? target.key : target);
        } catch (e) {
            // If we can not resolve the class instance, we will check to see if
            // the value is optional, and if it is we will return the optional
            // parameter value as the value of the dependency, similarly to how
            // we do this with scalars.
            if (e instanceof BindingResolutionError
                && parameter.isDefaultValueAvailable()) {
                return parameter.getDefaultValue();
            }

            throw e;
        }
    }

    /**
     * Throw an exception that the concrete is not instantiable.
     *
     * @param {*} concrete
     * @returns {void}
     *
     * @throws {BindingResolutionError}
     */
    protected _notInstantiable<T>(concrete: T): void {
        let message = `Target [${Builder._formatName(concrete)}] is not instantiable`;

        if (this._buildStack.length) {
            const previous = this._buildStack
                .map((_: any): string => _.name)
                .join(', ');

            message += ` while building [${previous}].`;
        } else {
            message += '.';
        }

        throw new BindingResolutionError(message);
    }

    /**
     * Throw an exception for an unresolvable primitive.
     *
     * @param {ReflectionParameter} parameter
     * @returns {void}
     *
     * @throws {BindingResolutionError}
     */
    protected _unresolvablePrimitive(parameter: ReflectionParameter): void {
        const message = `Unresolvable dependency resolving [${parameter.getName()}] in class ${(parameter.getDeclaringClass() as any).getName()}`;

        throw new BindingResolutionError(message);
    }

}

export default Builder;
