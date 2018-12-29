import {Identifier} from '../../Support/types';

interface IAliasManager {

    /**
     * Determine if a given string is an alias.
     *
     * @param {Identifier} name
     * @returns {boolean}
     */
    isAlias<T>(name: Identifier<T>): boolean;

    /**
     * Alias a type to a different name.
     *
     * @param {Identifier} abstract
     * @param {Identifier} alias
     * @returns {void}
     */
    alias<U, V>(abstract: Identifier<U>, alias: Identifier<V>): void;

    /**
     * Get the alias for an abstract if available.
     *
     * @param {Identifier} abstract
     * @returns {Identifier}
     *
     * @throws {LogicError}
     */
    getAlias<T>(abstract: Identifier<T>): Identifier<any>;

    /**
     * Delete the type alias for the given abstract.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    forgetAlias<T>(abstract: Identifier<T>): void;

    /**
     * Clear all the type aliases.
     *
     * @returns {void}
     */
    forgetAliases(): void;

    /**
     * Clear all the aliases keyed by the abstract name.
     *
     * @returns {void}
     */
    forgetAbstractAliases(): void;

    /**
     * Remove an alias from the contextual binding alias cache.
     *
     * @param {Identifier} searched
     * @returns {void}
     */
    removeAbstractAlias<T>(searched: Identifier<T>): void;

    /**
     * Determine if the registered alias keyed by the given abstract name
     * exists.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    hasAbstractAlias<T>(abstract: Identifier<T>): boolean;

    /**
     * Get the registered alias keyed by the given abstract name.
     *
     * @param {Identifier} abstract
     * @returns {(Array|undefined)}
     */
    getAbstractAlias<T>(abstract: Identifier<T>): any[] | undefined;

}

export default IAliasManager;
