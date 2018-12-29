import Container from './Container';
import IResolver from '../Contracts/Container/IResolver';
import {empty} from '../Support/Arr';
import {equals, isUndefined, isInstantiable, isString} from '../Support/helpers';
import {Identifier} from '../Support/types';

class Resolver implements IResolver {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * An array of the types that have been resolved.
     *
     * @var {Map}
     */
    protected _resolved: Map<any, boolean> = new Map;

    /**
     * All of the global resolving callbacks.
     *
     * @var {Function[]}
     */
    protected _globalResolvingCallbacks: Function[] = [];

    /**
     * All of the global after resolving callbacks.
     *
     * @var {Function[]}
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
     * Create a new resolver.
     *
     * @param {Container} container
     */
    public constructor(container: Container) {
        this._container = container;
    }

    /**
     * Resolve the given type from the container.
     *
     * @param {Identifier} abstract
     * @param {(Array|Object)} [parameters=[]]
     * @returns {*}
     */
    public resolve<T>(abstract: Identifier<T>, parameters: any[] | object = []): any {
        abstract = this._container.getAlias<T>(abstract);

        const needsContextualBuild = !empty(parameters)
            || !!this._container.getContextualBinder().getContextualConcrete<T>(abstract);

        // If an instance of the type is currently being managed as a singleton
        // we'll just return an existing instance instead of instantiating new
        // instances so the developer can keep using the same objects instance
        // every time.
        if (this._container.getInstanceSharer().hasSharedInstance<T>(abstract)
            && !needsContextualBuild) {
            return this._container
                .getInstanceSharer()
                .getSharedInstance<T>(abstract);
        }

        this._container.getBuilder().pushParameterOverride(parameters);

        const concrete = this._getConcrete<T>(abstract);

        // We're ready to instantiate an instance of the concrete type
        // registered for the binding. This will instantiate the types, as well
        // as resolve any of its "nested" dependencies recursively until all
        // have gotten resolved.
        let object = this._isBuildable<any, T>(concrete, abstract)
            ? this._container.build<any>(concrete)
            : this.resolve<any>(concrete);

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
        if (this._container.isShared<T>(abstract) && !needsContextualBuild) {
            this._container
                .getInstanceSharer()
                .addSharedInstance<T>(abstract, object);
        }

        this._fireResolvingCallbacks<T>(abstract, object);

        // Before returning, we will also set the resolved flag to "true" and
        // pop off the parameter overrides for this build. After those two
        // things are done we will be ready to return back the fully constructed
        // class instance.
        this._resolved.set(abstract, true);

        this._container.getBuilder().popParameterOverride();

        return object;
    }

    /**
     * Determine if the given abstract type has been resolved.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public resolved<T>(abstract: Identifier<T>): boolean {
        if (this._container.isAlias<T>(abstract)) {
            abstract = this._container.getAlias<T>(abstract);
        }

        return this._resolved.has(abstract)
            || this._container.getInstanceSharer().hasSharedInstance<T>(abstract);
    }

    /**
     * Delete the resolved type for the given abstract.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public forgetResolved<T>(abstract: Identifier<T>): void {
        this._resolved.delete(abstract);
    }

    /**
     * Clear all the resolved types.
     *
     * @returns {void}
     */
    public forgetAllResolved(): void {
        this._resolved.clear();
    }

    /**
     * Register a new resolving callback.
     *
     * @param {(Identifier|Function)} abstract
     * @param {(Function|undefined)} callback
     * @returns {void}
     */
    public resolving<T>(abstract: Identifier<T> | Function, callback?: Function): void {
        if (isString(abstract) || isInstantiable(abstract)) {
            abstract = this._container.getAlias<T>(abstract);
        }

        if (isUndefined(callback) && !isInstantiable(abstract)
            && abstract instanceof Function) {
            this._globalResolvingCallbacks.push(abstract);
        } else if (!isUndefined(callback)) {
            this._resolvingCallbacks.has(abstract)
                ? this._resolvingCallbacks.get(abstract)!.push(callback)
                : this._resolvingCallbacks.set(abstract, [callback]);
        }
    }

    /**
     * Register a new after resolving callback for all types.
     *
     * @param {(Identifier|Function)} abstract
     * @param {(Function|undefined)} callback
     * @returns {void}
     */
    public afterResolving<T>(abstract: Identifier<T>| Function, callback?: Function): void {
        if (isString(abstract) || isInstantiable(abstract)) {
            abstract = this._container.getAlias<T>(abstract);
        }

        if (isUndefined(callback) && !isInstantiable(abstract)
            && abstract instanceof Function) {
            this._globalAfterResolvingCallbacks.push(abstract);
        } else if (!isUndefined(callback)) {
            this._afterResolvingCallbacks.has(abstract)
                ? this._afterResolvingCallbacks.get(abstract)!.push(callback)
                : this._afterResolvingCallbacks.set(abstract, [callback]);
        }
    }

    /**
     * Get the concrete type for a given abstract.
     *
     * @param {Identifier} abstract
     * @returns {*}
     */
    protected _getConcrete<T>(abstract: Identifier<T>): Identifier<T> | any {
        const concrete = this._container
            .getContextualBinder()
            .getContextualConcrete<T>(abstract);

        if (!isUndefined(concrete)) return concrete;

        // If we don't have a registered resolver or concrete for the type,
        // we'll just assume each type is a concrete name and will attempt to
        // resolve it as is since the container should be able to resolve
        // concretes automatically.
        if (this._container.getBinder().hasBinding(abstract)) {
            return this._container.getBinder().getBinding(abstract)!.concrete;
        }

        return abstract;
    }

    /**
     * Determine if the given concrete is buildable.
     *
     * @param {(Identifier|*)} concrete
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    protected _isBuildable<U, V>(concrete: Identifier<U> | Function,
        abstract: Identifier<V>): boolean {
        return equals(concrete, abstract)
            || (!isInstantiable(concrete) && concrete instanceof Function);
    }

    /**
     * Fire all of the resolving callbacks.
     *
     * @param {Identifier} abstract
     * @param {Object} object
     * @returns {void}
     */
    protected _fireResolvingCallbacks<T>(abstract: Identifier<T>,
        object: object): void {
        if (this._globalResolvingCallbacks.length) {
            this._fireCallbackArray(object, this._globalResolvingCallbacks);
        }

        this._resolvingCallbacks.forEach(
            (callbacks: Function[], type: any): void => {
                if (type === abstract || object instanceof type) {
                    this._fireCallbackArray(object, callbacks);
                }
            }
        );

        this._fireAfterResolvingCallbacks<T>(abstract, object);
    }

    /**
     * Fire all of the after resolving callbacks.
     *
     * @param {Identifier} abstract
     * @param {Object} object
     * @returns {void}
     */
    protected _fireAfterResolvingCallbacks<T>(abstract: Identifier<T>,
        object: object): void {
        if (this._globalAfterResolvingCallbacks.length) {
            this._fireCallbackArray(object, this._globalAfterResolvingCallbacks);
        }

        this._afterResolvingCallbacks.forEach(
            (callbacks: Function[], type: any): void => {
                if (type === abstract || object instanceof type) {
                    this._fireCallbackArray(object, callbacks);
                }
            }
        );
    }

    /**
     * Fire an array of callbacks with an object.
     *
     * @param {Object} object
     * @param {Function[]} callbacks
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
     * @param {Identifier} abstract
     * @returns {Function[]}
     */
    protected _getExtenders<T>(abstract: Identifier<T>): Function[] {
        abstract = this._container.getAlias<T>(abstract);

        const manager = this._container.getExtender();

        if (manager.hasExtenders(abstract)) {
            return manager.getExtenders(abstract) as Function[];
        }

        return [];
    }

}

export default Resolver;
