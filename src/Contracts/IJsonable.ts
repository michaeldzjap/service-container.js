import {Instance} from '../types/container';

interface IJsonable {

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
export const isJsonable = <T>(instance: Instance<T>): instance is IJsonable => (
    Reflect.has(instance, 'toJson')
);

export default IJsonable;
