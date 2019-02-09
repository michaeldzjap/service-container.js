import {Identifier} from '../../types/container';

interface InstanceSharer {

    /**
     * Register an existing instance as shared in the container.
     *
     * @param {Identifier} abstract
     * @param {*} instance
     * @returns {*}
     */
    instance<U, V>(abstract: Identifier<U>, instance: V): V;

}

export default InstanceSharer;
