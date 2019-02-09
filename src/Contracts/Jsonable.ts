import {Instance} from '../types/container';

interface Jsonable {

    /**
     * Convert class instance properties to JSON.
     *
     * @returns {string}
     */
    toJson(): string;

}

/**
 * Determine if a given instance implements the interface.
 *
 * @param {Instance} instance
 * @returns {boolean}
 */
export const isJsonable = <T>(instance: Instance<T>): instance is Jsonable => (
    Reflect.has(instance, 'toJson')
);

export default Jsonable;
