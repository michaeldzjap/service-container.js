import {Instantiable} from '../../types/container';

interface IBuilder {

    /**
     * Instantiate a concrete instance of the given type.
     *
     * @param {(Identifier|Function)} concrete
     * @returns {*}
     */
    build<T>(concrete: Instantiable<T> | Function): any;

}

export default IBuilder;
