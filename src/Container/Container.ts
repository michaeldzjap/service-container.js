import Arr from '../Support/Arr';
import BindingResolutionError from './BindingResolutionError';
import BoundMethod from './BoundMethod';
import Callable from './Callable';
import ContextualBindingBuilder from './ContextualBindingBuilder';
import EntryNotFoundError from './EntryNotFoundError';
import IContainer from '../Contracts/Container/IContainer';
import LogicError from './LogicError';
import NestedMap from '../Support/NestedMap';
import ReflectionClass from '../Reflection/ReflectionClass';
import ReflectionParameter from '../Reflection/ReflectionParameter';
import {Binding, Identifier, Instantiable} from '../Support/types';
import {isClass, isString, isNullOrUndefined} from '../Support/helpers';

class Container implements IContainer {

    /**
     * The current globally available container (if any).
     *
     * @var Container
     */
    protected static _instance?: Container;

    /**
     * The contextual binding map.
     *
     * @var {Map}
     */
    public _contextual: NestedMap<any, Map<any, any>> = new NestedMap;

    /**
     * An array of the types that have been resolved.
     *
     * @var {Map}
     */
    protected _resolved: Map<any, boolean> = new Map;

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
     * The extension closures for services.
     *
     * @var {Map}
     */
    protected _extenders: Map<any, Function[]> = new Map;

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
     * @var {Array}
     */
    protected _with: Array<any[] | object> = [];

    /**
     * All of the registered rebound callbacks.
     *
     * @var {Map}
     */
    protected _reboundCallbacks: Map<any, Function[]> = new Map;

    /**
     * All of the global resolving callbacks.
     *
     * @var {Array}
     */
    protected _globalResolvingCallbacks: Function[] = [];

    /**
     * All of the global after resolving callbacks.
     *
     * @var {Array}
     */
    protected _globalAfterResolvingCallbacks: Function[] = [];

    /**
     * All of the resolving callbacks by class type.
     *
     * @var {Map}
     */
    protected _resolvingCallbacks: Map<any, Function[]> = new Map;

    /**
     * All of the after resolving callbacks by class type.
     *
     * @var {Map}
     */
    protected _afterResolvingCallbacks: Map<any, Function[]> = new Map;

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
     * @param {Container|undefined} container
     * @returns {Container}
     */
    public static setInstance(container?: Container): Container | undefined {
        return (Container._instance = container);
    }

    /**
     * Define a contextual binding.
     *
     * @param {mixed} concrete
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
     * @param {mixed} abstract
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
     * @param {mixed} id
     * @returns {boolean}
     */
    public has<T>(id: Identifier<T>): boolean {
        return this.bound<T>(id);
    }

    /**
     * Determine if the given abstract type has been resolved.
     *
     * @param {mixed} abstract
     * @returns {boolean}
     */
    public resolved<T>(abstract: Identifier<T>): boolean {
        if (this.isAlias<T>(abstract)) {
            abstract = this.getAlias<T>(abstract);
        }

        return this._resolved.has(abstract) || this._instances.has(abstract);
    }

    /**
     * Determine if a given type is shared.
     *
     * @param {mixed} abstract
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
     * @param {mixed} name
     * @returns {boolean}
     */
    public isAlias<T>(name: Identifier<T>): boolean {
        return this._aliases.has(name);
    }

    /**
     * Register a binding with the container.
     *
     * @param {Identifier} abstract
     * @param {Identifier|Function|undefined} concrete
     * @param {boolean} shared
     * @returns {void}
     */
    public bind<U, V>(abstract: Identifier<U>, concrete?: Identifier<V> | Function,
        shared: boolean = false): void {
        // If no concrete type was given, we will simply set the concrete type
        // to the abstract type. After that, the concrete type to be registered
        // as shared without being forced to state their classes in both of the
        // parameters.
        this._dropStaleInstances<U>(abstract);

        if (isNullOrUndefined(concrete)) {
            concrete = abstract as Identifier<V>;
        }

        // If the factory is not a Closure, it means it is just a class name
        // which is bound into this container to the abstract type and we will
        // just wrap it up inside its own Closure to give us more convenience
        // when extending.
        if (isClass(concrete) /* || typeof concrete === 'symbol' */) {
            concrete = this._getClosure<U, V>(abstract, concrete as Identifier<V>);
        }

        this._bindings.set(abstract, {concrete: concrete as Function, shared});

        // If the abstract type was already resolved in this container we'll
        // fire the rebound listener so that any objects which have already
        // gotten resolved can have their copy of the object updated via the
        // listener callbacks.
        if (this.resolved<U>(abstract)) this._rebound<U>(abstract);
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
        this._resolved.delete(abstract);
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
     * @param {Array|string} method
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
     * @param {mixed} instance
     * @returns {mixed}
     */
    public callMethodBinding(method: string, instance: any): any {
        return (this._methodBindings as any).get(method)(instance, this);
    }

    /**
     * Add a contextual binding to the container.
     *
     * @param {mixed} concrete
     * @param {Identifier} abstract
     * @param {mixed} implementation
     * @returns {void}
     */
    public addContextualBinding<T>(concrete: any, abstract: Identifier<T>,
        implementation: any): void {
        this._contextual.set(
            [concrete, this.getAlias<T>(abstract)],
            implementation
        );
    }

    /**
     * Register a binding if it hasn't already been registered.
     *
     * @param {mixed} abstract
     * @param {mixed|undefined} concrete
     * @param {boolean} shared
     * @returns {void}
     */
    public bindIf<U, V>(abstract: Identifier<U>, concrete?: Identifier<V> | Function,
        shared: boolean = false): void {
        if (!this.bound<U>(abstract)) {
            this.bind<U, V>(abstract, concrete, shared);
        }
    }

    /**
     * Register a shared binding in the container.
     *
     * @param {mixed} abstract
     * @param {mixed|undefined} concrete
     * @returns {void}
     */
    public singleton<U, V>(abstract: Identifier<U>, concrete?: Identifier<V> | Function): void {
        this.bind<U, V>(abstract, concrete, true);
    }

    /**
     * "Extend" an abstract type in the container.
     *
     * @param {mixed} abstract
     * @param {Function} closure
     * @returns {void}
     */
    public extend<T>(abstract: Identifier<T>, closure: Function): void {
        abstract = this.getAlias<T>(abstract);

        if (this._instances.has(abstract)) {
            this._instances.set(
                abstract, closure(this._instances.get(abstract), this)
            );

            this._rebound<T>(abstract);
        } else {
            this._extenders.has(abstract)
                ? this._extenders.set(
                    abstract,
                    [...this._extenders.get(abstract) as Function[], closure]
                )
                : this._extenders.set(abstract, [closure]);

            if (this.resolved<T>(abstract)) {
                this._rebound<T>(abstract);
            }
        }
    }

    /**
     * Register an existing instance as shared in the container.
     *
     * @param {mixed} abstract
     * @param {mixed} instance
     * @returns {mixed}
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

        if (isBound) {
            this._rebound<U>(abstract);
        }

        return instance;
    }

    /**
     * Assign a set of tags to a given binding.
     *
     * @param {Array|Identifier} abstracts
     * @param {Array} tags
     * @returns {void}
     */
    public tag<T>(abstracts: Identifier<T>[] | Identifier<T>, tags: string[]): void {
        for (const tag of tags) {
            if (!this._tags.has(tag)) {
                this._tags.set(tag, []);
            }

            for (const abstract of Arr.wrap(abstracts)) {
                this._tags.set(tag, [...(this._tags as any).get(tag), abstract]);
            }
        }
    }

    /**
     * Resolve all of the bindings for a given tag.
     *
     * @param {string} tag
     * @returns {Array}
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
     * @param {mixed} abstract
     * @param {mixed} alias
     * @returns {void}
     */
    public alias<U, V>(abstract: Identifier<U>, alias: Identifier<V>): void {
        this._aliases.set(alias, abstract);

        const arr = this._abstractAliases.get(abstract);
        this._abstractAliases.set(
            abstract,
            arr ? [...arr as Identifier<U>[], alias] : [alias]
        );
    }

    /**
     * Bind a new callback to an abstract's rebind event.
     *
     * @param {mixed} abstract
     * @param {Function} callback
     * @returns {mixed|undefined}
     */
    public rebinding<T>(abstract: Identifier<T>, callback: Function): unknown | undefined {
        abstract = this.getAlias<T>(abstract);
        this._reboundCallbacks.set(
            abstract,
            this._reboundCallbacks.has(abstract)
                ? [...this._reboundCallbacks.get(abstract) as Function[], callback]
                : [callback]
        );

        if (this.bound<T>(abstract)) {
            return this.make<T>(abstract);
        }
    }

    /**
     * Refresh an instance on the given target and method.
     *
     * @param {mixed} abstract
     * @param {mixed} target
     * @param {string} method
     * @returns {mixed}
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
     * @param {Object|Array|undefined} parameters
     * @returns {Function}
     */
    public wrap<T>(callback: Callable<T>, parameters?: any[] | object): Function {
        return (): unknown => this.call(callback, parameters);
    }

    /**
     * Call the given Closure / class@method and inject its dependencies.
     *
     * @param {Callable} callback
     * @param {Object|Array|undefined} parameters
     * @param {string|undefined} defaultMethod
     * @returns {mixed}
     */
    public call<T>(callback: Callable<T>, parameters?: any[] | object, defaultMethod?: string): any {
        return BoundMethod.call<T>(this, callback, parameters, defaultMethod);
    }

    /**
     * Get a closure to resolve the given type from the container.
     *
     * @param {mixed} abstract
     * @returns {Function}
     */
    public factory<T>(abstract: Identifier<T>): Function {
        return (): unknown => this.make<T>(abstract);
    }

    /**
     * Resolve the given type from the container.
     *
     * @param {mixed} abstract
     * @param {Array|Object} parameters
     * @returns {mixed}
     */
    public make<T>(abstract: Identifier<T>, parameters: any[] | object = []): any {
        return this._resolve<T>(abstract, parameters);
    }

    /**
     * Finds an entry of the container by its identifier and returns it.
     *
     * @param {mixed} id
     * @returns {mixed}
     *
     * @throws {@src/Container/EntryNotFoundError}
     */
    public get<T>(id: Identifier<T>): any {
        try {
            return this._resolve<T>(id);
        } catch (e) {
            if (this.has(id)) throw e;

            throw new EntryNotFoundError;
        }
    }

    /**
     * Set (bind) a new entry of the container by its identifier.
     *
     * @param {mixed} id
     * @param {mixed} value
     * @returns {void}
     */
    public set<U, V>(id: Identifier<U>, value: V): void {
        this.bind(
            id,
            value instanceof Function && !isClass(value)
                ? value
                : (): any => value
        );
    }

    /**
     * Instantiate a concrete instance of the given type.
     *
     * @param {mixed} concrete
     * @returns {Object}
     */
    public build<T>(concrete: Instantiable<T> | Function): any {
        // If the concrete type is actually a Closure, we will just execute it
        // and hand back the results of the functions, which allows functions
        // to be used as resolvers for more fine-tuned resolution of these
        // objects.
        if (!isClass(concrete) && concrete instanceof Function) {
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
     * @param {mixed} abstract
     * @param {Function|undefined} callback
     * @returns {void}
     */
    public resolving<T>(abstract: Identifier<T> | Function, callback?: Function): void {
        if (isString(abstract) || isClass(abstract)) {
            abstract = this.getAlias<T>(abstract);
        }

        if (!callback && !isClass(abstract) && abstract instanceof Function) {
            this._globalResolvingCallbacks.push(abstract);
        } else {
            this._resolvingCallbacks.has(abstract)
                ? this._resolvingCallbacks.set(
                    abstract,
                    [...this._resolvingCallbacks.get(abstract) as any, callback]
                )
                : this._resolvingCallbacks.set(abstract, [callback as Function]);
        }
    }

    /**
     * Register a new after resolving callback for all types.
     *
     * @param {mixed} abstract
     * @param {Function} callback
     * @returns {void}
     */
    public afterResolving<T>(abstract: Identifier<T>| Function, callback: Function): void {
        if (isString(abstract) || isClass(abstract)) {
            abstract = this.getAlias<T>(abstract);
        }

        if (!callback && !isClass(abstract) && abstract instanceof Function) {
            this._globalAfterResolvingCallbacks.push(abstract);
        } else {
            this._afterResolvingCallbacks.has(abstract)
                ? this._afterResolvingCallbacks.set(
                    abstract,
                    [...this._afterResolvingCallbacks.get(abstract) as any, callback]
                )
                : this._afterResolvingCallbacks.set(abstract, [callback]);
        }
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
     * Get the alias for an abstract if available.
     *
     * @param {mixed} abstract
     * @returns {mixed}
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
        this._extenders.delete(this.getAlias(abstract));
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
        this._resolved.clear();
        this._bindings.clear();
        this._instances.clear();
        this._abstractAliases.clear();
    }

    /**
     * Get the Closure to be used when building a type.
     *
     * @param {mixed} abstract
     * @param {mixed} concrete
     * @returns {Function}
     */
    protected _getClosure<U, V>(abstract: Identifier<U>, concrete: Identifier<V>): Function {
        return (container: Container, parameters: Map<string, any> = new Map): unknown => {
            if (abstract === concrete) {
                return container.build<V>(concrete as Instantiable<V>);
            }

            return container.make(concrete, parameters);
        };
    }

    /**
     * Get the method to be bound in class@method format.
     *
     * @param {Array|string} method
     * @returns {string}
     */
    protected _parseBindMethod<T>(method: [T, string] | string): string {
        if (Array.isArray(method)) {
            return `${(method[0] as any).name}@${method[1]}`;
        }

        return method;
    }

    /**
     * Remove an alias from the contextual binding alias cache.
     *
     * @param {mixed} searched
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
     * Fire the "rebound" callbacks for the given abstract type.
     *
     * @param {mixed} abstract
     * @returns {void}
     */
    protected _rebound<T>(abstract: Identifier<T>): void {
        const instance = this.make<T>(abstract);

        for (const callback of this._getReboundCallbacks<T>(abstract)) {
            callback(this, instance);
        }
    }

    /**
     * Get the rebound callbacks for a given type.
     *
     * @param {mixed} abstract
     * @returns {Array}
     */
    protected _getReboundCallbacks<T>(abstract: Identifier<T>): Function[] {
        if (this._reboundCallbacks.has(abstract)) {
            return this._reboundCallbacks.get(abstract) as Function[];
        }

        return [];
    }

    /**
     * Resolve the given type from the container.
     *
     * @param {mixed} abstract
     * @param {Map} parameters
     * @returns {mixed}
     */
    protected _resolve<T>(abstract: Identifier<T>, parameters: any[] | object = []): any {
        abstract = this.getAlias<T>(abstract);

        const needsContextualBuild = !Arr.empty(parameters)
            || !!this._getContextualConcrete<T>(abstract);

        // If an instance of the type is currently being managed as a singleton
        // we'll just return an existing instance instead of instantiating new
        // instances so the developer can keep using the same objects instance
        // every time.
        if (this._instances.has(abstract) && !needsContextualBuild) {
            return this._instances.get(abstract);
        }

        this._with.push(parameters);

        const concrete = this._getConcrete<T>(abstract);

        // We're ready to instantiate an instance of the concrete type
        // registered for the binding. This will instantiate the types, as well
        // as resolve any of its "nested" dependencies recursively until all
        // have gotten resolved.
        let object = this._isBuildable<any, T>(concrete, abstract)
            ? this.build<any>(concrete)
            : this.make<any>(concrete);

        // If we defined any extenders for this type, we'll need to spin through
        // them and apply them to the object being built. This allows for the
        // extension of services, such as changing configuration or decorating
        // the object.
        for (const extender of this._getExtenders<T>(abstract)) {
            object = extender(object, this);
        }

        // If the requested type is registered as a singleton we'll want to
        // cache off the instances in "memory" so we can return it later without
        // creating an entirely new instance of an object on each subsequent
        // request for it.
        if (this.isShared<T>(abstract) && !needsContextualBuild) {
            this._instances.set(abstract, object);
        }

        this._fireResolvingCallbacks<T>(abstract, object);

        // Before returning, we will also set the resolved flag to "true" and
        // pop off the parameter overrides for this build. After those two
        // things are done we will be ready to return back the fully constructed
        // class instance.
        this._resolved.set(abstract, true);

        this._with.pop();

        return object;
    }

    /**
     * Get the concrete type for a given abstract.
     *
     * @param {mixed} abstract
     * @returns {mixed} concrete
     */
    protected _getConcrete<T>(abstract: Identifier<T>): Identifier<T> | any {
        const concrete = this._getContextualConcrete<T>(abstract);
        if (!isNullOrUndefined(concrete)) {
            return concrete;
        }

        // If we don't have a registered resolver or concrete for the type,
        // we'll just assume each type is a concrete name and will attempt to
        // resolve it as is since the container should be able to resolve
        // concretes automatically.
        if (this._bindings.has(abstract)) {
            return this._bindings.get(abstract)!.concrete;
        }

        return abstract;
    }

    /**
     * Get the contextual concrete binding for the given abstract.
     *
     * @param {mixed} abstract
     * @returns {mixed}
     */
    protected _getContextualConcrete<T>(abstract: Identifier<T>): any {
        const binding = this._findInContextualBindings(abstract);
        if (!isNullOrUndefined(binding)) {
            return binding;
        }

        // Next we need to see if a contextual binding might be bound under an
        // alias of the given abstract type. So, we will need to check if any
        // aliases exist with this type and then spin through them and check for
        // contextual bindings on these.
        if (!this._abstractAliases.has(abstract)
            || (this._abstractAliases.has(abstract)
                && !this._abstractAliases.get(abstract)!.length)) {
            return;
        }

        for (const alias of this._abstractAliases.get(abstract) as any[]) {
            const binding = this._findInContextualBindings<any>(alias);
            if (!isNullOrUndefined(binding)) {
                return binding;
            }
        }
    }

    /**
     * Find the concrete binding for the given abstract in the contextual
     * binding array.
     *
     * @param {Function|string} abstract
     * @returns {mixed|undefined}
     */
    protected _findInContextualBindings<T>(abstract: Identifier<T>): any {
        if (this._contextual.has([Arr.last(this._buildStack), abstract])) {
            return this._contextual.get([Arr.last(this._buildStack), abstract]);
        }
    }

    /**
     * Determine if the given concrete is buildable.
     *
     * @param {mixed} concrete
     * @param {mixed} abstract
     * @returns {boolean}
     */
    protected _isBuildable<U, V>(concrete: Identifier<U> | U, abstract: Identifier<V>): boolean {
        return concrete === abstract
            || (!isClass(concrete) && concrete instanceof Function);
    }

    /**
     * Resolve all of the dependencies from the ReflectionParameters.
     *
     * @param {Array} dependencies
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
     * @returns {mixed}
     */
    protected _getParameterOverride(dependency: ReflectionParameter): any {
        return this._getLastParameterOverride()[dependency.getName()];
    }

    /**
     * Get the last parameter override.
     *
     * @returns {Array|Object}
     */
    protected _getLastParameterOverride(): any[] | object {
        return this._with.length ? Arr.last(this._with) : [];
    }

    /**
     * Resolve a non-class hinted primitive dependency.
     *
     * @param {ReflectionParameter} parameter
     * @returns {mixed|undefined}
     */
    protected _resolvePrimitive(parameter: ReflectionParameter): any | undefined {
        const concrete = this._getContextualConcrete(parameter.getName());
        if (concrete) {
            return concrete instanceof Function
                ? (concrete as Function)(this)
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
     * @returns {mixed}
     *
     * @throws {BindingResolutionError}
     */
    protected _resolveClass(parameter: ReflectionParameter): any {
        const reflector = parameter.getClass();

        if (isNullOrUndefined(reflector)) {
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
            if (e instanceof BindingResolutionError && parameter.isDefaultValueAvailable()) {
                return parameter.getDefaultValue();
            }

            throw e;
        }
    }

    /**
     * Throw an exception that the concrete is not instantiable.
     *
     * @param {string} concrete
     * @returns {void}
     *
     * @throws {@src/Container/BindingResolutionError}
     */
    protected _notInstantiable<T>(concrete: T): void {
        let message = `Target [${typeof concrete === 'symbol' ? concrete.toString() : (concrete as any).name}] is not instantiable`;

        if (this._buildStack.length) {
            const previous = this._buildStack
                .map((_: string): string => (_ as any).name)
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
        const message = `
            Unresolvable dependency resolving [${parameter.getName()}] in class
            ${(parameter.getDeclaringClass() as any).getName()}
        `;

        throw new BindingResolutionError(message);
    }

    /**
     * Fire all of the resolving callbacks.
     *
     * @param {mixed} abstract
     * @param {mixed} object
     * @returns {void}
     */
    protected _fireResolvingCallbacks<T>(abstract: Identifier<T>, object: object): void {
        this._fireCallbackArray(object, this._globalResolvingCallbacks);

        this._fireCallbackArray(
            object,
            this._getCallbacksForType<T>(abstract, object, this._resolvingCallbacks)
        );

        this._fireAfterResolvingCallbacks<T>(abstract, object);
    }

    /**
     * Fire all of the after resolving callbacks.
     *
     * @param {mixed} abstract
     * @param {mixed} object
     * @returns {void}
     */
    protected _fireAfterResolvingCallbacks<T>(abstract: Identifier<T>, object: object): void {
        this._fireCallbackArray(object, this._globalAfterResolvingCallbacks);

        this._fireCallbackArray(
            object,
            this._getCallbacksForType<T>(abstract, object, this._afterResolvingCallbacks)
        );
    }

    /**
     * Get all callbacks for a given type.
     *
     * @param {mixed} abstract
     * @param {mixed} object
     * @param {Map} callbacksPerType
     * @returns {Array}
     */
    protected _getCallbacksForType<T>(abstract: Identifier<T>, object: object,
        callbacksPerType: Map<string, Function[]>): Function[] {
        const results: Function[] = [];

        callbacksPerType.forEach((callbacks: Function[], type: any): void => {
            if (type === abstract || object instanceof type) {
                results.push(...callbacks);
            }
        });

        return results;
    }

    /**
     * Fire an array of callbacks with an object.
     *
     * @param {mixed} object
     * @param {Array} callbacks
     * @returns {void}
     */
    protected _fireCallbackArray(object: object, callbacks: Function[]): void {
        for (const callback of callbacks) {
            callback(object, this);
        }
    }

    /**
     * Get the extender callbacks for a given type.
     *
     * @param {mixed} abstract
     * @returns {Array}
     */
    protected _getExtenders<T>(abstract: Identifier<T>): Function[] {
        abstract = this.getAlias<T>(abstract);

        if (this._extenders.has(abstract)) {
            return this._extenders.get(abstract) as Function[];
        }

        return [];
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
