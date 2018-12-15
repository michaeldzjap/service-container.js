import Callable from '@src/Container/Callable';
import ContextualBindingBuilder from '@src/Container/ContextualBindingBuilder';
import {Identifier, Instantiable} from '@typings/index';

interface IContainer {

    /**
     * Determine of the given abstract type has been bound.
     *
     * @param {mixed} abstract
     * @returns {boolean}
     */
    bound<T>(abstract: Identifier<T>): boolean;

    /**
     * Alias a type to a different name.
     *
     * @param {mixed} abstract
     * @param {mixed} alias
     * @returns {void}
     */
    alias<U, V>(abstract: Identifier<U>, alias: Identifier<V>): void;

    /**
     * Assign a set of tags to a given binding.
     *
     * @param {mixed} abstracts
     * @param {Array} tags
     * @returns {void}
     */
    tag<T>(abstracts: Identifier<T>[] | Identifier<T>, tags: string[]): void;

    /**
     * Resolve all of the bindings for a given tag.
     *
     * @param {string} tag
     * @returns {Array}
     */
    tagged(tag: string): unknown[];

    /**
     * Register a binding with the container.
     *
     * @param {mixed} abstract
     * @param {mixed|undefined} concrete
     * @param {boolean} shared
     * @returns {void}
     */
    bind<U, V>(abstract: Identifier<U>, concrete?: Identifier<V> | Function, shared?: boolean): void;

    /**
     * Unregister a binding with the container.
     *
     * @param {mixed} abstract
     * @returns {void}
     */
    unbind<U>(abstract: Identifier<U>): void;

    /**
     * Register a binding if it hasn't already been registered.
     *
     * @param {string} abstract
     * @param mixed|undefined} concrete
     * @param {boolean} shared
     * @returns {void}
     */
    bindIf<U, V>(abstract: Identifier<U>, concrete?: Identifier<V> | Function, shared?: boolean): void;

    /**
     * Register a shared binding in the container.
     *
     * @param {string} abstract
     * @param {mixed|undefined} concrete
     * @returns {void}
     */
    singleton<U, V>(abstract: Identifier<U>, concrete?: Identifier<V> | Function): void;

    /**
     * "Extend" an abstract type in the container.
     *
     * @param {mixed} abstract
     * @param {Function} closure
     * @returns {void}
     */
    extend<T>(abstract: Identifier<T>, closure: Function): void;

    /**
     * Register an existing instance as shared in the container.
     *
     * @param {mixed} abstract
     * @param {mixed} instance
     * @returns {mixed}
     */
    instance<U, V>(abstract: Identifier<U>, instance: V): V;

    /**
     * Define a contextual binding.
     *
     * @param {Array|Instantiable} concrete
     * @returns {ContextualBindingBuilder}
     */
    when<T>(concrete: Instantiable<T>[] | Instantiable<T>): ContextualBindingBuilder;

    /**
     * Get a closure to resolve the given type from the container.
     *
     * @param {mixed} abstract
     * @returns {Function}
     */
    factory<T>(abstract: Identifier<T>): Function;

    /**
     * Resolve the given type from the container.
     *
     * @param {mixed} abstract
     * @param {Array|Object} parameters
     * @returns {mixed}
     */
    make<T>(abstract: Identifier<T>, parameters: any[] | object): any;

    /**
     * Call the given Closure / class method and inject its dependencies.
     *
     * @param {Callable} callback
     * @param {Array|Object|undefined} parameters
     * @param {string|undefined} defaultMethod
     * @returns {unknown}
     */
    call<T>(callback: Callable<T>, parameters?: any[] | object, defaultMethod?: string): any;

    /**
     * Determine if the given abstract type has been resolved.
     *
     * @param {mixed} abstract
     * @returns {boolean}
     */
    resolved<T>(abstract: Identifier<T>): boolean;

    /**
     * Register a new resolving callback.
     *
     * @param {mixed} abstract
     * @param {Function|undefined} callback
     * @returns {void}
     */
    resolving<T>(abstract: Identifier<T> | Function, callback?: Function): void;

    /**
     * Register a new after resolving callback.
     *
     * @param {mixed} abstract
     * @param {Function|undefined} callback
     * @returns {void}
     */
    afterResolving<T>(abstract: Identifier<T> | Function, callback?: Function): void;

    /**
     * Finds an entry of the container by its identifier and returns it.
     *
     * @param {mixed} id
     * @returns {mixed}
     *
     * @throws {@src/Container/EntryNotFoundError}
     */
    get<T>(id: Identifier<T>): any;

    /**
     * Set (bind) a new entry of the container by its identifier.
     *
     * @param {mixed} id
     * @param {mixed} value
     * @returns {void}
     */
    set<U, V>(id: Identifier<U>, value: V): void;

    /**
     * Returns true if the container can return an entry for the given
     * identifier. Returns false otherwise.
     *
     * @param {mixed} id
     * @returns {boolean}
     */
    has<T>(id: Identifier<T>): boolean;

}

export default IContainer;
