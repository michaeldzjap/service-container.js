import {isObject} from '../Support/helpers';
import {Instance} from '../types/container';

interface Objectable {

    /**
     * Convert class instance properties to a data object.
     *
     * @returns {Object}
     */
    toObject(): object;

}

/**
 * Determine if a given instance implements the interface.
 *
 * @param {Instance} instance
 * @returns {boolean}
 */
export const isObjectable = <T>(instance: Instance<T>): instance is Objectable => (
    isObject(instance) && Reflect.has(instance, 'toObject')
);

export default Objectable;
