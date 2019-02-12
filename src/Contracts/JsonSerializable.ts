import {isObject} from '../Support/helpers';
import {Instance} from '../types/container';

interface JsonSerializable {

    /**
     * Convert class instance properties to something that is JSON serializable.
     *
     * @returns {(Array|Object)}
     */
    jsonSerialize(): any[] | object;

}

/**
 * Determine if a given instance implements the interface.
 *
 * @param {Instance} instance
 * @returns {boolean}
 */
export const isJsonSerializable = <T>(instance: Instance<T>): instance is JsonSerializable => (
    isObject(instance) && Reflect.has(instance, 'jsonSerialize')
);

export default JsonSerializable;
