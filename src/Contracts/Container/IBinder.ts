import {Binding, Identifier, Instantiable} from '../../Support/types';

interface IBinder {

    /**
     * Determine if the container contains the given binding.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    hasBinding<T>(abstract: Identifier<T>): boolean;

    /**
     * Get a binding from the container.
     *
     * @param {Identifier} abstract
     * @returns {(Binding|undefined)}
     */
    getBinding<T>(abstract: Identifier<T>): Binding | undefined;

    /**
     * Determine if the given abstract type has been bound.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    bound<T>(abstract: Identifier<T>): boolean;

    /**
     * Register a binding if it hasn't already been registered.
     *
     * @param {Identifier} abstract
     * @param {(Instantiable|Function|undefined)} concrete
     * @param {boolean} [shared=false]
     * @returns {void}
     */
    bindIf<U, V>(abstract: Identifier<U>, concrete?: Instantiable<V> | Function,
        shared?: boolean): void;

    /**
     * Register a binding with the container.
     *
     * @param {Identifier} abstract
     * @param {?(Identifier|Function|undefined)} concrete
     * @param {boolean} [shared=false]
     * @returns {void}
     */
    bind<U, V>(abstract: Identifier<U>, concrete?: Instantiable<V> | Function,
        shared?: boolean): void;

    /**
     * Fire the "rebound" callbacks for the given abstract type.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    rebound<T>(abstract: Identifier<T>): void;

    /**
     * Bind a new callback to an abstract's rebind event.
     *
     * @param {Identifier} abstract
     * @param {Function} callback
     * @returns {(*|undefined)}
     */
    rebinding<T>(abstract: Identifier<T>, callback: Function): unknown | undefined;

    /**
     * Get the container's bindings.
     *
     * @returns {Map}
     */
    getBindings(): Map<any, Binding>;

    /**
     * Delete the bindings for the given abstract.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    forgetBinding<T>(abstract: Identifier<T>): void;

    /**
     * Clear all the bindings.
     *
     * @returns {void}
     */
    forgetBindings(): void;

}

export default IBinder;
