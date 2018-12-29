import {last, wrap} from '../Arr';
import {isString} from '../helpers';

class ESNextNestedMap<U, V> extends Map<U, V> {

    /**
     * Add or update an element of a map at a given (sequence of) key(s).
     * Providing multiple keys in the form of an array or dot separated key
     * string results in a nested map structure.
     *
     * @param {*} keys
     * @param {*} value
     * @returns {void}
     */
    public set(keys: any, value: any): this {
        keys = isString(keys) ? keys.split('.') : wrap(keys);

        if (keys.length === 1) {
            // Let the native 'set' method handle things
            super.set(keys[0], value);

            return this;
        }

        /* eslint-disable consistent-this */

        let target = this;
        for (const key of keys) {
            if (key === last(keys)) {
                target.set(key, value);
            } else {
                // eslint-disable-next-line max-depth
                if (!target.has(key)) {
                    target.set(key, new Map);
                }
                target = target.get(key);
            }
        }

        /* eslint-enable consistent-this */

        return this;
    }

    /**
     * Return the element of a map at the given (sequence of) key(s).
     *
     * @param {*} keys
     * @returns {*}
     */
    public get(keys: any): any {
        keys = isString(keys) ? keys.split('.') : wrap(keys);

        if (keys.length === 1) {
            // Let the native 'get' method handle things
            return super.get(keys[0]);
        }

        /* eslint-disable consistent-this */

        let target = this;
        for (const key of keys) {
            if (!target.has(key)) return;

            if (key === last(keys)) {
                return target.get(key);
            }

            target = target.get(key);
        }

        /* eslint-enable consistent-this */
    }

    /**
     * Check if the map contains an element with the given (sequence of) key(s).
     *
     * @param {*} keys
     * @returns {boolean}
     */
    public has(keys: any): boolean {
        keys = isString(keys) ? keys.split('.') : wrap(keys);

        if (keys.length === 1) {
            // Let the native 'has' method handle things
            return super.has(keys[0]);
        }

        /* eslint-disable consistent-this */

        let target = this;
        for (const key of keys) {
            if (!target.has(key)) return false;

            if (key === last(keys)) {
                return true;
            }

            target = target.get(key);
        }

        /* eslint-enable consistent-this */

        return false;
    }

    /**
     * Remove an element with the given (sequence of) key(s) from a map.
     *
     * @param {*} keys
     * @returns {boolean}
     */
    public delete(keys: any): boolean {
        keys = isString(keys) ? keys.split('.') : wrap(keys);

        if (keys.length === 1) {
            // Let the native 'delete' method handle things
            return super.delete(keys[0]);
        }

        /* eslint-disable consistent-this */

        let target = this;
        for (const key of keys) {
            if (!target.has(key)) return false;

            if (key === last(keys)) {
                return target.delete(key);
            }

            target = target.get(key);
        }

        /* eslint-enable consistent-this */

        return false;
    }

}

export default ESNextNestedMap;
