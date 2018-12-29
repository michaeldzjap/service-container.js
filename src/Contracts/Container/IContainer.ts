import Callable from '../../Container/Callable';
import ContextualBindingBuilder from '../../Container/ContextualBindingBuilder';
import IAliaser from './IAliaser';
import IBinder from './IBinder';
import IExtender from './IExtender';
import IInstanceSharer from './IInstanceSharer';
import IResolver from './IResolver';
import ITagger from './ITagger';
import {Identifier, Instantiable} from '../../Support/types';

interface IContainer extends IAliaser, IBinder, IExtender, IInstanceSharer, IResolver, ITagger {

    /**
     * Unregister a binding with the container.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    unbind<U>(abstract: Identifier<U>): void;

    /**
     * Register a shared binding in the container.
     *
     * @param {Identifier} abstract
     * @param {(Identifier|Function|undefined)} concrete
     * @returns {void}
     */
    singleton<U, V>(abstract: Identifier<U>, concrete?: Identifier<V> | Function): void;

    /**
     * Define a contextual binding.
     *
     * @param {(Instantiable[]|Instantiable)} concrete
     * @returns {ContextualBindingBuilder}
     */
    when<T>(concrete: Instantiable<T>[] | Instantiable<T>): ContextualBindingBuilder;

    /**
     * Get a closure to resolve the given type from the container.
     *
     * @param {Identifier} abstract
     * @returns {Function}
     */
    factory<T>(abstract: Identifier<T>): Function;

    /**
     * Resolve the given type from the container.
     *
     * @param {Identifier} abstract
     * @param {(*[]|Object)} parameters
     * @returns {*}
     */
    make<T>(abstract: Identifier<T>, parameters: any[] | object): any;

    /**
     * Call the given Closure / class method and inject its dependencies.
     *
     * @param {Callable} callback
     * @param {(*[]|Object|undefined)} parameters
     * @param {(string|undefined)} defaultMethod
     * @returns {*}
     */
    call<T>(callback: Callable<T>, parameters?: any[] | object, defaultMethod?: string): any;

    /**
     * Finds an entry of the container by its identifier and returns it.
     *
     * @param {Identifier} id
     * @returns {*}
     *
     * @throws {EntryNotFoundError}
     */
    get<T>(id: Identifier<T>): any;

    /**
     * Set (bind) a new entry of the container by its identifier.
     *
     * @param {Identifier} id
     * @param {*} value
     * @returns {*}
     */
    set<U, V>(id: Identifier<U>, value: V): void;

    /**
     * Returns true if the container can return an entry for the given
     * identifier. Returns false otherwise.
     *
     * @param {Identifier} id
     * @returns {boolean}
     */
    has<T>(id: Identifier<T>): boolean;

}

export default IContainer;
