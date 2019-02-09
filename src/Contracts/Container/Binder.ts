import {Identifier, Instantiable} from '../../types/container';

interface Binder {

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

}

export default Binder;
