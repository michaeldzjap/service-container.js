import Aliaser from './Aliaser';
import Arr from '../Support/Arr';
import Binder from './Binder';
import BoundMethod from './BoundMethod';
import Builder from './Builder';
import Callable from './Callable';
import ContextualBindingBuilder from './ContextualBindingBuilder';
import ContextualBinder from './ContextualBinder';
import EntryNotFoundError from './EntryNotFoundError';
import Extender from './Extender';
import IContainer from '../Contracts/Container/IContainer';
import MethodBinder from './MethodBinder';
import Resolver from './Resolver';
import Tagger from './Tagger';
import {Binding, Identifier, Instantiable} from '../Support/types';
import {isInstantiable} from '../Support/helpers';

class Container implements IContainer {

    /**
     * The current globally available container (if any).
     *
     * @var {Container}
     */
    protected static _instance?: Container;

    /**
     * The container's shared instances.
     *
     * @var {Map}
     */
    protected _instances: Map<any, any> = new Map;

    /**
     * The contextual binding manager.
     *
     * @var {ContextualBinder}
     */
    protected _contextualBinder: ContextualBinder;

    /**
     * The type aliaser instance.
     *
     * @var {Aliaser}
     */
    protected _aliaser: Aliaser;

    /**
     * The builder instance.
     *
     * @var {Builder}
     */
    protected _builder: Builder;

    /**
     * The method binder instance.
     *
     * @var {MethodBinder}
     */
    protected _methodBinder: MethodBinder;

    /**
     * The binder instance.
     *
     * @var {Binder}
     */
    protected _binder: Binder;

    /**
     * The resolver instance.
     *
     * @var {Resolver}
     */
    protected _resolver: Resolver;

    /**
     * The extender instance.
     *
     * @var {Extender}
     */
    protected _extender: Extender;

    /**
     * The tagger instance.
     *
     * @var {Tagger}
     */
    protected _tagger: Tagger;

    /**
     * Create a new container instance.
     */
    public constructor() {
        this._contextualBinder = new ContextualBinder(this);
        this._aliaser = new Aliaser(this);
        this._builder = new Builder(this);
        this._extender = new Extender(this);
        this._methodBinder = new MethodBinder(this);
        this._binder = new Binder(this);
        this._resolver = new Resolver(this);
        this._tagger = new Tagger(this);
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
        return this._binder.bound(abstract);
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
            || (this._binder.hasBinding(abstract)
                && this._binder.getBinding(abstract)!.shared);
    }

    /**
     * Determine if a given string is an alias.
     *
     * @param {Identifier} name
     * @returns {boolean}
     */
    public isAlias<T>(name: Identifier<T>): boolean {
        return this._aliaser.isAlias(name);
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
        this._binder.bind(abstract, concrete, shared);
    }

    /**
     * Unregister a binding with the container.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public unbind<T>(abstract: Identifier<T>): void {
        this._binder.forgetBinding(abstract);
        this._instances.delete(abstract);
        this._resolver.forgetResolved(abstract);
    }

    /**
     * Determine if the container has a method binding.
     *
     * @param {string} method
     * @returns {boolean}
     */
    public hasMethodBinding(method: string): boolean {
        return this._methodBinder.hasMethodBinding(method);
    }

    /**
     * Bind a callback to resolve with Container::call.
     *
     * @param {(Array|string)} method
     * @param {Function} callback
     * @returns {void}
     */
    public bindMethod<T>(method: [Instantiable<T>, string] | string, callback: Function): void {
        this._methodBinder.bindMethod(method, callback);
    }

    /**
     * Get the method binding for the given method.
     *
     * @param {string} method
     * @param {*} instance
     * @returns {*}
     */
    public callMethodBinding(method: string, instance: any): any {
        return this._methodBinder.callMethodBinding(method, instance);
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
     * Register a binding if it hasn't already been registered.
     *
     * @param {Identifier} abstract
     * @param {(Instantiable|Function|undefined)} concrete
     * @param {boolean} [shared=false]
     * @returns {void}
     */
    public bindIf<U, V>(abstract: Identifier<U>, concrete?: Instantiable<V> | Function,
        shared: boolean = false): void {
        this._binder.bindIf(abstract, concrete, shared);
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
        this._extender.extend<T>(abstract, closure);
    }

    /**
     * Register an existing instance as shared in the container.
     *
     * @param {Identifier} abstract
     * @param {*} instance
     * @returns {*}
     */
    public instance<U, V>(abstract: Identifier<U>, instance: V): V {
        this._aliaser.removeAbstractAlias<U>(abstract);

        const isBound = this.bound<U>(abstract);

        this._aliaser.forgetAlias(abstract);

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
        this._tagger.tag(abstracts, tags);
    }

    /**
     * Resolve all of the bindings for a given tag.
     *
     * @param {string} tag
     * @returns {Array}
     */
    public tagged(tag: string): any[] {
        return this._tagger.tagged(tag);
    }

    /**
     * Alias a type to a different name.
     *
     * @param {Identifier} abstract
     * @param {Identifier} alias
     * @returns {void}
     */
    public alias<U, V>(abstract: Identifier<U>, alias: Identifier<V>): void {
        this._aliaser.alias<U, V>(abstract, alias);
    }

    /**
     * Bind a new callback to an abstract's rebind event.
     *
     * @param {Identifier} abstract
     * @param {Function} callback
     * @returns {(*|undefined)}
     */
    public rebinding<T>(abstract: Identifier<T>, callback: Function): unknown | undefined {
        return this._binder.rebinding<T>(abstract, callback);
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
        return this._builder.build<T>(concrete);
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
        return this._binder.getBindings();
    }

    /**
     * Get the binder.
     *
     * @returns {Binder}
     */
    public getBinder(): Binder {
        return this._binder;
    }

    /**
     * Get the builder.
     *
     * @returns {Builder}
     */
    public getBuilder(): Builder {
        return this._builder;
    }

    /**
     * Get the resolver.
     *
     * @returns {Resolver}
     */
    public getResolver(): Resolver {
        return this._resolver;
    }

    /**
     * Get the aliaser.
     *
     * @returns {Aliaser}
     */
    public getAliaser(): Aliaser {
        return this._aliaser;
    }

    /**
     * Get the contextual binder instance.
     *
     * @returns {ContextualBinder}
     */
    public getContextualBinder(): ContextualBinder {
        return this._contextualBinder;
    }

    /**
     * Get the extender manager instance.
     *
     * @returns {Extender}
     */
    public getExtender(): Extender {
        return this._extender;
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
        return this._aliaser.getAlias<T>(abstract);
    }

    /**
     * Remove all of the extender callbacks for a given type.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public forgetExtenders<T>(abstract: Identifier<T>): void {
        this._extender.forgetExtenders(abstract);
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
        this._aliaser.forgetAliases();
        this._resolver.forgetAllResolved();
        this._binder.forgetBindings();
        this._instances.clear();
        this._aliaser.forgetAbstractAliases();
    }

    /**
     * Fire the "rebound" callbacks for the given abstract type.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public rebound<T>(abstract: Identifier<T>): void {
        this._binder.rebound(abstract);
    }

}

export default Container;
