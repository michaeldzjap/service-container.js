import {Identifier} from '../../types/container';

interface IResolver {

    /**
     * Determine if the given abstract type has been resolved.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    resolved<T>(abstract: Identifier<T>): boolean;

    /**
     * Register a new resolving callback.
     *
     * @param {(Identifier|Function)} abstract
     * @param {(Function|undefined)} callback
     * @returns {void}
     */
    resolving<T>(abstract: Identifier<T> | Function, callback?: Function): void;

    /**
     * Register a new after resolving callback for all types.
     *
     * @param {(Identifier|Function)} abstract
     * @param {(Function|undefined)} callback
     * @returns {void}
     */
    afterResolving<T>(abstract: Identifier<T>| Function, callback?: Function): void;

}

export default IResolver;
