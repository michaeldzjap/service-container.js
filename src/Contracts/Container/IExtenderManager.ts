import {Identifier} from '../../Support/types';

interface IExtenderManager {

    /**
     * "Extend" an abstract type in the container.
     *
     * @param {Identifier} abstract
     * @param {Function} closure
     * @returns {void}
     */
    extend<T>(abstract: Identifier<T>, closure: Function): void;

    /**
     * Remove all of the extender callbacks for a given type.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    forgetExtenders<T>(abstract: Identifier<T>): void;

    /**
     * Determine if the container contains the given extension closure.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    hasExtenders<T>(abstract: Identifier<T>): boolean;

    /**
     * Get the extension closure for services keyed by the given abstract name.
     *
     * @param {Identifier} abstract
     * @returns {(Function[]|undefined)}
     */
    getExtenders<T>(abstract: Identifier<T>): Function[] | undefined;

}

export default IExtenderManager;
