import {Identifier, Instantiable} from '../../types/container';

interface IClassBinding {

    /**
     * Get the Closure to be used when building a type.
     *
     * @param {Identifier} abstract
     * @param {Identifier} concrete
     * @returns {Function}
     */
    getClosure<U, V>(abstract: Identifier<U>, concrete: Instantiable<V>): Function;

}

export default IClassBinding;
