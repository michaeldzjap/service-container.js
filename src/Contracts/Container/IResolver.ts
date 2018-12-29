import {Identifier} from '../../Support/types';

interface IResolver {

    /**
     * Resolve the given type from the container.
     *
     * @param {Identifier} abstract
     * @param {(*[]|Object)} [parameters=[]]
     * @returns {*}
     */
    resolve<T>(abstract: Identifier<T>, parameters: any[] | object): any;

    /**
     * Determine if the given abstract type has been resolved.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    resolved<T>(abstract: Identifier<T>): boolean;

    /**
     * Delete the resolved type for the given abstract.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    forgetResolved<T>(abstract: Identifier<T>): void;

    /**
     * Clear all the resolved types.
     *
     * @returns {void}
     */
    forgetAllResolved(): void;

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
