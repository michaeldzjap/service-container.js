import {Identifier} from '../../types/container';

interface IContextualBinder {

    /**
     * Add a contextual binding to the container.
     *
     * @param {*} concrete
     * @param {Identifier} abstract
     * @param {*} implementation
     * @returns {void}
     */
    addContextualBinding<T>(concrete: any, abstract: Identifier<T>, implementation: any): void;

    /**
     * Get the contextual concrete binding for the given abstract.
     *
     * @param {Identifier} abstract
     * @returns {*}
     */
    getContextualConcrete<T>(abstract: Identifier<T>): any;

}

export default IContextualBinder;
