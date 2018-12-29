import BindingError from './BindingError';
import ClassBinding from './ClassBinding';
import Container from './Container';
import IBinder from '../Contracts/Container/IBinder';
import {isNullOrUndefined, isInstantiable} from '../Support/helpers';
import {Binding, Identifier, Instantiable} from '../Support/types';

class Binder implements IBinder {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * The container's bindings.
     *
     * @var {Map}
     */
    protected _bindings: Map<any, Binding> = new Map;

    /**
     * All of the registered rebound callbacks.
     *
     * @var {Map}
     */
    protected _reboundCallbacks: Map<any, Function[]> = new Map;

    /**
     * Create a new class binding builder.
     *
     * @param {Container} container
     */
    public constructor(container: Container) {
        this._container = container;
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
     * Determine if the given abstract type has been bound.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public bound<T>(abstract: Identifier<T>): boolean {
        return this._bindings.has(abstract)
            || this._container.getInstanceSharer().hasSharedInstance(abstract)
            || this._container.isAlias<T>(abstract);
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
            const builder = new ClassBinding(this._container);
            concrete = builder.getClosure(abstract, concrete);
        }

        this._bindings.set(abstract, {concrete, shared});

        // If the abstract type was already resolved in this container we'll
        // fire the rebound listener so that any objects which have already
        // gotten resolved can have their copy of the object updated via the
        // listener callbacks.
        if (this._container.getResolver().resolved<U>(abstract)) {
            this.rebound<U>(abstract);
        }
    }

    /**
     * Fire the "rebound" callbacks for the given abstract type.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public rebound<T>(abstract: Identifier<T>): void {
        const instance = this._container.make<T>(abstract);

        for (const callback of this._getReboundCallbacks<T>(abstract)) {
            callback(this, instance);
        }
    }

    /**
     * Bind a new callback to an abstract's rebind event.
     *
     * @param {Identifier} abstract
     * @param {Function} callback
     * @returns {(*|undefined)}
     */
    public rebinding<T>(abstract: Identifier<T>, callback: Function): unknown | undefined {
        abstract = this._container.getAlias<T>(abstract);

        this._reboundCallbacks.has(abstract)
            ? this._reboundCallbacks.get(abstract)!.push(callback)
            : this._reboundCallbacks.set(abstract, [callback]);

        if (this.bound<T>(abstract)) return this._container.make<T>(abstract);
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
     * Delete the bindings for the given abstract.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public forgetBinding<T>(abstract: Identifier<T>): void {
        this._bindings.delete(abstract);
    }

    /**
     * Clear all the bindings.
     *
     * @returns {void}
     */
    public forgetBindings(): void {
        this._bindings.clear();
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
     * Drop all of the stale instances and aliases.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    protected _dropStaleInstances<T>(abstract: Identifier<T>): void {
        this._container.forgetInstance(abstract);
        this._container.getAliaser().forgetAlias(abstract);
    }

}

export default Binder;
