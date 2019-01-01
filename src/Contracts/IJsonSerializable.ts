import {Instance} from '../Support/types';

interface IJsonSerializable {

    /**
     * Convert class instance properties to something that is JSON serializable.
     *
     * @returns {Object}
     */
    jsonSerialize(): object;

}

/**
 * Determine if a given instance implements the interface.
 *
 * @param {Instance} instance
 * @returns {boolean}
 */
export const isJsonSerializable = <T>(instance: Instance<T>): instance is IJsonSerializable => (
    Reflect.has(instance, 'jsonSerialize')
);

export default IJsonSerializable;
