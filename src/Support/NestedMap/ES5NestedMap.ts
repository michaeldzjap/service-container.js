import {last, wrap} from '../Arr';
import {isString} from '../helpers';

class ES5NestedMap<U, V> {

    /**
     * The map instance.
     *
     * @var {Map}
     */
    private _map: Map<U, V> = new Map;

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
            this._map.set(keys[0], value);

            return this;
        }

        /* eslint-disable consistent-this, @typescript-eslint/no-this-alias */

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

        /* eslint-enable consistent-this, @typescript-eslint/no-this-alias */

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
            return this._map.get(keys[0]);
        }

        /* eslint-disable consistent-this, @typescript-eslint/no-this-alias */

        let target = this;
        for (const key of keys) {
            if (!target.has(key)) return;

            if (key === last(keys)) {
                return target.get(key);
            }

            target = target.get(key);
        }

        /* eslint-enable consistent-this, @typescript-eslint/no-this-alias */
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
            return this._map.has(keys[0]);
        }

        /* eslint-disable consistent-this, @typescript-eslint/no-this-alias */

        let target = this;
        for (const key of keys) {
            if (!target.has(key)) return false;

            if (key === last(keys)) {
                return true;
            }

            target = target.get(key);
        }

        /* eslint-enable consistent-this, @typescript-eslint/no-this-alias */

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
            return this._map.delete(keys[0]);
        }

        /* eslint-disable consistent-this, @typescript-eslint/no-this-alias */

        let target = this;
        for (const key of keys) {
            if (!target.has(key)) return false;

            if (key === last(keys)) {
                return target.delete(key);
            }

            target = target.get(key);
        }

        /* eslint-enable consistent-this, @typescript-eslint/no-this-alias */

        return false;
    }

}

export default ES5NestedMap;
