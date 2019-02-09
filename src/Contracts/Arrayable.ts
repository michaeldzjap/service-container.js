import {Instance} from '../types/container';

interface Arrayable {

    /**
     * Convert class instance properties to an array.
     *
     * @returns {Array}
     */
    toArray(): unknown[];

}

/**
 * Determine if a given instance implements the interface.
 *
 * @param {Instance} instance
 * @returns {boolean}
 */
export const isArrayable = <T>(instance: Instance<T>): instance is Arrayable => (
    Reflect.has(instance, 'toArray')
);

export default Arrayable;
