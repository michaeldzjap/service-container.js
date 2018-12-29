import Arr from '../Support/Arr';
import BindingError from './BindingError';
import BindingResolutionError from './BindingResolutionError';
import BoundMethod from './BoundMethod';
import Callable from './Callable';
import ClassBinding from './ClassBinding';
import ContextualBindingBuilder from './ContextualBindingBuilder';
import ContextualBindingManager from './ContextualBindingManager';
import EntryNotFoundError from './EntryNotFoundError';
import ExtenderManager from './ExtenderManager';
import IContainer from '../Contracts/Container/IContainer';
import LogicError from './LogicError';
import ReflectionClass from '../Reflection/ReflectionClass';
import ReflectionParameter from '../Reflection/ReflectionParameter';
import Resolver from './Resolver';
import {Binding, Identifier, Instantiable} from '../Support/types';
import {
    isNullOrUndefined, isUndefined, getSymbolName, isInstance, isInstantiable
} from '../Support/helpers';

class Container implements IContainer {

    /**
     * The current globally available container (if any).
     *
     * @var {Container}
     */
    protected static _instance?: Container;

    /**
     * The container's bindings.
     *
     * @var {Map}
     */
    protected _bindings: Map<any, Binding> = new Map;

    /**
     * The container's method bindings.
     *
     * @var {Map}
     */
    protected _methodBindings: Map<string, Function> = new Map;

    /**
     * The container's shared instances.
     *
     * @var {Map}
     */
    protected _instances: Map<any, any> = new Map;

    /**
     * The registered type aliases.
     *
     * @var {Map}
     */
    protected _aliases: Map<any, any> = new Map;

    /**
     * The registered aliases keyed by the abstract name.
     *
     * @var {Map}
     */
    protected _abstractAliases: Map<any, any[]> = new Map;

    /**
     * All of the registered tags.
     *
     * @var {Map}
     */
    protected _tags: Map<string, any[]> = new Map;

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
    protected _with: Array<any[] | object> = [];

    /**
     * All of the registered rebound callbacks.
     *
     * @var {Map}
     */
    protected _reboundCallbacks: Map<any, Function[]> = new Map;

    /**
     * The contextual binding manager.
     *
     * @var {ContextualBindingManager}
     */
    protected _contextualManager: ContextualBindingManager;

    /**
     * The resolver instance.
     *
     * @var {Resolver}
     */
    protected _resolver: Resolver;

    /**
     * The extender manager instance.
     *
     * @var {ExtenderManager}
     */
    protected _extenderManager: ExtenderManager;

    /**
     * Create a new container instance.
     */
    public constructor() {
        this._contextualManager = new ContextualBindingManager(this);
        this._extenderManager = new ExtenderManager(this);
        this._resolver = new Resolver(this);
    }

    /**
     * Set the globally available instance of the container.
     *
     * @returns {Container}
     */
    public static getInstance(): Container {
        if (!Container._instance) {
            Container._instance = new Container;
        }

        return Container._instance;
    }

    /**
     * Set the shared instance of the container.
     *
     * @param {(Container|undefined)} container
     * @returns {(Container|undefined)}
     */
    public static setInstance(container?: Container): Container | undefined {
        return (Container._instance = container);
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
     * Define a contextual binding.
     *
     * @param {(Instantiable[]|Instantiable)} concrete
     * @returns {ContextualBindingBuilder}
     */
    public when<T>(concrete: Instantiable<T>[] | Instantiable<T>): ContextualBindingBuilder {
        const aliases = [];

        for (const c of Arr.wrap(concrete)) {
            aliases.push(this.getAlias<T>(c));
        }

        return new ContextualBindingBuilder(this, aliases);
    }

    /**
     * Determine if the given abstract type has been bound.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public bound<T>(abstract: Identifier<T>): boolean {
        return this._bindings.has(abstract) || this._instances.has(abstract)
            || this.isAlias<T>(abstract);
    }

    /**
     * Returns true if the container can return an entry for the given
     * identifier. Returns false otherwise.
     *
     * @param {Identifier} id
     * @returns {boolean}
     */
    public has<T>(id: Identifier<T>): boolean {
        return this.bound<T>(id);
    }

    /**
     * Determine if the given abstract type has been resolved.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public resolved<T>(abstract: Identifier<T>): boolean {
        return this._resolver.resolved<T>(abstract);
    }

    /**
     * Determine if a given type is shared.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public isShared<T>(abstract: Identifier<T>): boolean {
        return this._instances.has(abstract)
            || (this._bindings.has(abstract)
                && this._bindings.get(abstract)!.shared);
    }

    /**
     * Determine if a given string is an alias.
     *
     * @param {Identifier} name
     * @returns {boolean}
     */
    public isAlias<T>(name: Identifier<T>): boolean {
        return this._aliases.has(name);
    }

    /**
     * Register a binding with the container.
     *
     * @param {Identifier} abstract
     * @param {?(Identifier|Function|undefined)} concrete
     * @param {boolean} [shared=false]
     * @returns {void}
     */
    public bind<U, V>(abstract: Identifier<U>, concrete?: Instantiable<V> | Function,
        shared: boolean = false): void {
        // If no concrete type was given, we will simply set the concrete type
        // to the abstract type. After that, the concrete type to be registered
        // as shared without being forced to state their classes in both of the
        // parameters.
        this._dropStaleInstances<U>(abstract);

        if (isNullOrUndefined(concrete) && isInstantiable(abstract)) {
            concrete = abstract as unknown as Instantiable<V>;
        } else if (isNullOrUndefined(concrete)) {
            throw new BindingError('Cannot bind a non-instantiable to itself.');
        }

        // If the factory is not a Closure, it means it is just a class name
        // which is bound into this container to the abstract type and we will
        // just wrap it up inside its own Closure to give us more convenience
        // when extending.
        if (isInstantiable(concrete)) {
            const builder = new ClassBinding(this);
            concrete = builder.getClosure(abstract, concrete);
        }

        this._bindings.set(abstract, {concrete, shared});

        // If the abstract type was already resolved in this container we'll
        // fire the rebound listener so that any objects which have already
        // gotten resolved can have their copy of the object updated via the
        // listener callbacks.
        if (this.resolved<U>(abstract)) this.rebound<U>(abstract);
    }

    /**
     * Unregister a binding with the container.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public unbind<T>(abstract: Identifier<T>): void {
        this._bindings.delete(abstract);
        this._instances.delete(abstract);
        this._resolver.deleteResolved(abstract);
    }

    /**
     * Determine if the container has a method binding.
     *
     * @param {string} method
     * @returns {boolean}
     */
    public hasMethodBinding(method: string): boolean {
        return !!this._methodBindings.has(method);
    }

    /**
     * Bind a callback to resolve with Container::call.
     *
     * @param {(Array|string)} method
     * @param {Function} callback
     * @returns {void}
     */
    public bindMethod<T>(method: [Instantiable<T>, string] | string, callback: Function): void {
        this._methodBindings.set(this._parseBindMethod(method), callback);
    }

    /**
     * Get the method binding for the given method.
     *
     * @param {string} method
     * @param {*} instance
     * @returns {*}
     */
    public callMethodBinding(method: string, instance: any): any {
        return (this._methodBindings as any).get(method)(instance, this);
    }

    /**
     * Determine if the container contains the given shared instance.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public hasSharedInstance<T>(abstract: Identifier<T>): boolean {
        return this._instances.has(abstract);
    }

    /**
     * Get a shared instance from the container.
     *
     * @param {Identifier} abstract
     * @returns {*}
     */
    public getSharedInstance<T>(abstract: Identifier<T>): any {
        return this._instances.get(abstract);
    }

    /**
     * Add a shared instance to the container.
     *
     * @param {Identifier} abstract
     * @param {*} implementation
     * @returns {void}
     */
    public addSharedInstance<T>(abstract: Identifier<T>, implementation: any): void {
        this._instances.set(abstract, implementation);
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
     * Determine if the registered alias keyed by the given abstract name
     * exists.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public hasAbstractAlias<T>(abstract: Identifier<T>): boolean {
        return this._abstractAliases.has(abstract);
    }

    /**
     * Get the registered alias keyed by the given abstract name.
     *
     * @param {Identifier} abstract
     * @returns {(Array|undefined)}
     */
    public getAbstractAlias<T>(abstract: Identifier<T>): any[] | undefined {
        return this._abstractAliases.get(abstract);
    }

    /**
     * Determine if the container contains the given binding.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public hasBinding<T>(abstract: Identifier<T>): boolean {
        return this._bindings.has(abstract);
    }

    /**
     * Get a binding from the container.
     *
     * @param {Identifier} abstract
     * @returns {(Binding|undefined)}
     */
    public getBinding<T>(abstract: Identifier<T>): Binding | undefined {
        return this._bindings.get(abstract);
    }

    /**
     * Register a binding if it hasn't already been registered.
     *
     * @param {Identifier} abstract
     * @param {(Instantiable|Function|undefined)} concrete
     * @param {boolean} [shared=false]
     * @returns {void}
     */
    public bindIf<U, V>(abstract: Identifier<U>, concrete?: Instantiable<V> | Function,
        shared: boolean = false): void {
        if (!this.bound<U>(abstract)) {
            this.bind<U, V>(abstract, concrete, shared);
        }
    }

    /**
     * Register a shared binding in the container.
     *
     * @param {Identifier} abstract
     * @param {(Instantiable|Function|undefined)} concrete
     * @returns {void}
     */
    public singleton<U, V>(abstract: Identifier<U>, concrete?: Instantiable<V> | Function): void {
        this.bind<U, V>(abstract, concrete, true);
    }

    /**
     * "Extend" an abstract type in the container.
     *
     * @param {Identifier} abstract
     * @param {Function} closure
     * @returns {void}
     */
    public extend<T>(abstract: Identifier<T>, closure: Function): void {
        this._extenderManager.extend<T>(abstract, closure);
    }

    /**
     * Register an existing instance as shared in the container.
     *
     * @param {Identifier} abstract
     * @param {*} instance
     * @returns {*}
     */
    public instance<U, V>(abstract: Identifier<U>, instance: V): V {
        this._removeAbstractAlias<U>(abstract);

        const isBound = this.bound<U>(abstract);

        this._aliases.delete(abstract);

        // We'll check to determine if this type has been bound before, and if
        // it has we will fire the rebound callbacks registered with the
        // container and it can be updated with consuming classes that have
        // gotten resolved here.
        this._instances.set(abstract, instance);

        if (isBound) this.rebound<U>(abstract);

        return instance;
    }

    /**
     * Assign a set of tags to a given binding.
     *
     * @param {(Identifier[]|Identifier)} abstracts
     * @param {string[]} tags
     * @returns {void}
     */
    public tag<T>(abstracts: Identifier<T>[] | Identifier<T>, tags: string[]): void {
        for (const tag of tags) {
            if (!this._tags.has(tag)) this._tags.set(tag, []);

            for (const abstract of Arr.wrap(abstracts)) {
                this._tags.get(tag)!.push(abstract);
            }
        }
    }

    /**
     * Resolve all of the bindings for a given tag.
     *
     * @param {string} tag
     * @returns {*[]}
     */
    public tagged(tag: string): any[] {
        const results: any[] = [];

        if (this._tags.has(tag)) {
            for (const abstract of (this._tags as any).get(tag)) {
                results.push(this.make(abstract));
            }
        }

        return results;
    }

    /**
     * Alias a type to a different name.
     *
     * @param {Identifier} abstract
     * @param {Identifier} alias
     * @returns {void}
     */
    public alias<U, V>(abstract: Identifier<U>, alias: Identifier<V>): void {
        this._aliases.set(alias, abstract);

        this._abstractAliases.has(abstract)
            ? this._abstractAliases.get(abstract)!.push(alias)
            : this._abstractAliases.set(abstract, [alias]);
    }

    /**
     * Bind a new callback to an abstract's rebind event.
     *
     * @param {Identifier} abstract
     * @param {Function} callback
     * @returns {(*|undefined)}
     */
    public rebinding<T>(abstract: Identifier<T>, callback: Function): unknown | undefined {
        abstract = this.getAlias<T>(abstract);

        this._reboundCallbacks.has(abstract)
            ? this._reboundCallbacks.get(abstract)!.push(callback)
            : this._reboundCallbacks.set(abstract, [callback]);

        if (this.bound<T>(abstract)) return this.make<T>(abstract);
    }

    /**
     * Refresh an instance on the given target and method.
     *
     * @param {Identifier} abstract
     * @param {Object} target
     * @param {string} method
     * @returns {*}
     */
    public refresh<T>(abstract: Identifier<T>, target: object, method: string): unknown {
        return this.rebinding<T>(abstract, (app: unknown, instance: unknown): void => {
            target[method](instance);
        });
    }

    /**
     * Wrap the given closure such that its dependencies will be injected when
     * executed.
     *
     * @param {Callable} callback
     * @param {(*[]|Object)} parameters
     * @returns {Function}
     */
    public wrap<T>(callback: Callable<T>, parameters?: any[] | object): Function {
        return (): unknown => this.call(callback, parameters);
    }

    /**
     * Call the given Closure / class@method and inject its dependencies.
     *
     * @param {Callable} callback
     * @param {(*[]|Object|undefined)} parameters
     * @param {(string|undefined)} defaultMethod
     * @returns {*}
     */
    public call<T>(callback: Callable<T>, parameters?: any[] | object,
        defaultMethod?: string): any {
        return BoundMethod.call<T>(this, callback, parameters, defaultMethod);
    }

    /**
     * Get a closure to resolve the given type from the container.
     *
     * @param {Identifier} abstract
     * @returns {Function}
     */
    public factory<T>(abstract: Identifier<T>): Function {
        return (): unknown => this.make<T>(abstract);
    }

    /**
     * Resolve the given type from the container.
     *
     * @param {Identifier} abstract
     * @param {(*[]|Object)} [parameters=[]]
     * @returns {*}
     */
    public make<T>(abstract: Identifier<T>, parameters: any[] | object = []): any {
        return this._resolver.resolve<T>(abstract, parameters);
    }

    /**
     * Finds an entry of the container by its identifier and returns it.
     *
     * @param {Identifier} id
     * @returns {*}
     *
     * @throws {EntryNotFoundError}
     */
    public get<T>(id: Identifier<T>): any {
        try {
            return this._resolver.resolve<T>(id);
        } catch (e) {
            if (this.has(id)) throw e;

            throw new EntryNotFoundError;
        }
    }

    /**
     * Set (bind) a new entry of the container by its identifier.
     *
     * @param {Identifier} id
     * @param {*} value
     * @returns {void}
     */
    public set<U, V>(id: Identifier<U>, value: V): void {
        this.bind(
            id,
            value instanceof Function && !isInstantiable(value)
                ? value
                : (): any => value
        );
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
            return concrete(this, this._getLastParameterOverride());
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
     * Register a new resolving callback.
     *
     * @param {(Identifier|Function)} abstract
     * @param {(Function|undefined)} callback
     * @returns {void}
     */
    public resolving<T>(abstract: Identifier<T> | Function, callback?: Function): void {
        this._resolver.resolving<T>(abstract, callback);
    }

    /**
     * Register a new after resolving callback for all types.
     *
     * @param {(Identifier|Function)} abstract
     * @param {(Function|undefined)} callback
     * @returns {void}
     */
    public afterResolving<T>(abstract: Identifier<T>| Function, callback?: Function): void {
        this._resolver.afterResolving<T>(abstract, callback);
    }

    /**
     * Get the container's bindings.
     *
     * @returns {Map}
     */
    public getBindings(): Map<any, Binding> {
        return this._bindings;
    }

    /**
     * Get the stack of concretions currently being built.
     *
     * @returns {Array}
     */
    public getLatestBuild(): any[] {
        return Arr.last(this._buildStack);
    }

    /**
     * Get the contextual binding manager.
     *
     * @returns {ContextualBindingManager}
     */
    public getContextualBindingManager(): ContextualBindingManager {
        return this._contextualManager;
    }

    /**
     * Get the extender manager instance.
     *
     * @returns {ExtenderManager}
     */
    public getExtenderManager(): ExtenderManager {
        return this._extenderManager;
    }

    /**
     * Get the alias for an abstract if available.
     *
     * @param {Identifier} abstract
     * @returns {Identifier}
     *
     * @throws {LogicError}
     */
    public getAlias<T>(abstract: Identifier<T>): Identifier<any> {
        if (!this._aliases.has(abstract)) {
            return abstract;
        }

        if (this._aliases.get(abstract) === abstract) {
            throw new LogicError(`[${String(abstract)}] is aliased to itself.`);
        }

        return this.getAlias<T>(this._aliases.get(abstract));
    }

    /**
     * Remove all of the extender callbacks for a given type.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public forgetExtenders<T>(abstract: Identifier<T>): void {
        this._extenderManager.forgetExtenders(abstract);
    }

    /**
     * Remove a resolved instance from the instance cache.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public forgetInstance<T>(abstract: Identifier<T>): void {
        this._instances.delete(abstract);
    }

    /**
     * Clear all of the instances from the container.
     *
     * @returns {void}
     */
    public forgetInstances(): void {
        this._instances.clear();
    }

    /**
     * Flush the container of all bindings and resolved instances.
     *
     * @returns {void}
     */
    public flush(): void {
        this._aliases.clear();
        this._resolver.clearResolved();
        this._bindings.clear();
        this._instances.clear();
        this._abstractAliases.clear();
    }

    /**
     * Fire the "rebound" callbacks for the given abstract type.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public rebound<T>(abstract: Identifier<T>): void {
        const instance = this.make<T>(abstract);

        for (const callback of this._getReboundCallbacks<T>(abstract)) {
            callback(this, instance);
        }
    }

    /**
     * Get the method to be bound in class@method format.
     *
     * @param {(Array|string)} method
     * @returns {string}
     */
    protected _parseBindMethod<T>(method: [Instantiable<T>, string] | string): string {
        if (Array.isArray(method)) {
            return `${method[0].name}@${method[1]}`;
        }

        return method;
    }

    /**
     * Remove an alias from the contextual binding alias cache.
     *
     * @param {Identifier} searched
     * @returns {void}
     */
    protected _removeAbstractAlias<T>(searched: Identifier<T>): void {
        if (!this._aliases.has(searched)) return;

        this._abstractAliases.forEach((aliases: any[], abstract: any): void => {
            this._abstractAliases.set(
                abstract,
                aliases.filter((alias: any): boolean => alias !== searched)
            );
        });
    }

    /**
     * Get the rebound callbacks for a given type.
     *
     * @param {Identifier} abstract
     * @returns {Function[]}
     */
    protected _getReboundCallbacks<T>(abstract: Identifier<T>): Function[] {
        if (this._reboundCallbacks.has(abstract)) {
            return this._reboundCallbacks.get(abstract) as Function[];
        }

        return [];
    }

    /**
     * Resolve all of the dependencies from the ReflectionParameters.
     *
     * @param {ReflectionParameter[]} dependencies
     * @returns {*[]}
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
     * @returns {(*[]|Object)}
     */
    protected _getLastParameterOverride(): any[] | object {
        return this._with.length ? Arr.last(this._with) : [];
    }

    /**
     * Resolve a non-class hinted primitive dependency.
     *
     * @param {ReflectionParameter} parameter
     * @returns {(*|undefined)}
     */
    protected _resolvePrimitive(parameter: ReflectionParameter): any | undefined {
        const concrete = this._contextualManager
            .getContextualConcrete(parameter.getName());

        if (concrete) {
            return concrete instanceof Function
                ? concrete(this)
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

            return this.make(reflector.isInterface() ? target.key : target);
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
        let message = `Target [${Container._formatName(concrete)}] is not instantiable`;

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

    /**
     * Drop all of the stale instances and aliases.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    protected _dropStaleInstances<T>(abstract: Identifier<T>): void {
        this._instances.delete(abstract);
        this._aliases.delete(abstract);
    }

}

export default Container;
