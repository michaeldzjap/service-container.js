import Rand from 'rand-seed';

import {dataGet, isNullOrUndefined, isObject, isString, value} from './helpers';

class Arr {

    /**
     * Determine whether the given value is array accessible.
     *
     * @param {mixed} value
     * @returns {boolean}
     */
    public static accessible(value: any): boolean {
        return Array.isArray(value) || isObject(value);
    }

    /**
     * Add an element to an object using "dot" notation if it doesn't exist.
     *
     * @param {Object} obj
     * @param {string} key
     * @param {mixed} value
     * @returns {obj}
     */
    public static add(obj: object, key: string, value: any): object {
        obj = {...obj};

        if (!obj.hasOwnProperty(key)) {
            Arr.set(obj, key, value);
        }

        return obj;
    }

    /**
     * Collapse an array of arrays into a single array.
     *
     * @param {Array} array
     * @returns {Array}
     */
    public static collapse(array: unknown[] | object): unknown[] | object {
        if (Array.isArray(array)) {
            return Arr._collapseArray(array);
        }

        return Arr._collapseObject(array);
    }

    /**
     * Cross join the given arrays, returning all possible permutations.
     *
     * @param {Array} ...arrays
     * @returns {Array}
     */
    public static crossJoin(...arrays: any[]): unknown[][] {
        let results: any[][] = [[]];

        let index = 0;
        for (const array of arrays) {
            const append: any[] = [];

            for (const product of results) {
                // eslint-disable-next-line max-depth
                for (const item of array) {
                    product[index] = item;

                    append.push([...product]);
                }
            }

            results = append;
            index++;
        }

        return results;
    }

    /**
     * Divide an array or object into two arrays. One with keys and the other
     * with values.
     *
     * @param {(Array|Object)} array
     * @returns {Array}
     */
    public static divide(array: unknown[] | object): unknown[] {
        if (Array.isArray(array)) {
            return [
                Array.from(Array(5), (x: undefined, i: number): number => i),
                [...array],
            ];
        }

        return [Object.keys(array), (Object as any).values(array)];
    }

    /**
     * Flatten a multi-dimensional object with dots.
     *
     * @param {Object} obj
     * @param {string} prepend
     * @returns {Object}
     */
    public static dot(obj: object, prepend: string = ''): object {
        let results = {};

        for (const key of Object.keys(obj)) {
            if (isObject(obj[key]) && Object.keys(obj[key]).length) {
                results = {...results, ...Arr.dot(obj[key], `${prepend}${key}.`)};
            } else {
                results[`${prepend}${key}`] = obj[key];
            }
        }

        return results;
    }

    /**
     * Get all of the given object except for a specified array of keys.
     *
     * @param {Object} obj
     * @param {(Array|string)} keys
     * @returns {Object}
     */
    public static except(obj: object, keys: string[] | string): object {
        obj = {...obj};

        Arr.forget(obj, keys);

        return obj;
    }

    /**
     * Determine if the given key exists in the provided array.
     *
     * @param {(Array|Object)} array
     * @param {(number|string)} key
     * @returns {boolean}
     */
    public static exists(array: unknown[] | object, key: number | string): boolean {
        if (Array.isArray(array)) {
            return key >= 0 && key < array.length;
        }

        return array.hasOwnProperty(key);
    }

    /**
     * Return the first element in an array passing a given truth test.
     *
     * @param {Array} array
     * @param {?Function} callback
     * @param {mixed} dflt
     * @returns {mixed}
     */
    public static first(array: unknown[], callback?: Function, dflt?: unknown): unknown {
        if (isNullOrUndefined(callback)) {
            if (!array.length) return value(dflt);

            for (const item of array) return item;
        }

        let key = 0;
        for (const value of array) {
            if ((callback as Function)(value, key)) return value;
            key++;
        }

        return value(dflt);
    }

    /**
     * Return the last element in an array passing a given truth test.
     *
     * @param {Array} array
     * @param {?Function} callback
     * @param {?mixed} dflt
     * @returns {mixed}
     */
    public static last(array: unknown[], callback?: Function, dflt?: unknown): any {
        if (isNullOrUndefined(callback)) {
            return array.length ? array[array.length - 1] : value(dflt);
        }

        return Arr.first(array.reverse(), callback, dflt);
    }

    /**
     * Flatten a multi-dimensional array into a single level.
     *
     * @param {Array} array
     * @param {number} depth
     * @returns {Array}
     */
    public static flatten(array: unknown[], depth: number = Infinity): unknown[] {
        let result: unknown[] = [];

        for (const item of array) {
            if (!Array.isArray(item)) {
                result.push(item);
            } else if (depth === 1) {
                result = [...result, ...item];
            } else {
                result = [...result, ...Arr.flatten(item, depth - 1)];
            }
        }

        return result;
    }

    /**
     * Remove one or many object properties from a given object using "dot"
     * notation.
     *
     * @param {Object} obj
     * @param {(Array|string)} keys
     * @returns {void}
     */
    public static forget(obj: object, keys: string[] | string): void {
        const original = obj;

        keys = Arr.wrap(keys) as string[];

        if (keys.length === 0) return;

        // eslint-disable-next-line no-labels
        loop1:
        for (const key of keys) {
            // If the exact key exists in the top-level, remove it
            if (Arr.exists(obj, key)) {
                delete obj[key];

                continue;
            }

            const parts = key.split('.');

            // Clean up before each pass
            obj = original;

            while (parts.length > 1) {
                const part = parts.shift() as string;

                // eslint-disable-next-line max-depth
                if (obj.hasOwnProperty(part) && isObject(obj[part])) {
                    obj = obj[part];
                } else {
                    continue loop1;
                }
            }

            delete obj[parts.shift() as string];
        }
    }

    /**
     * Get an item from an array using "dot" notation.
     *
     * @param {Object} obj
     * @param {?string} key
     * @param {mixed} dflt
     * @returns {mixed}
     */
    public static get(obj: object, key?: string, dflt?: unknown): unknown {
        if (!Arr.accessible(obj)) return value(dflt);

        if (isNullOrUndefined(key)) return obj;

        key = key as string;

        if (Arr.exists(obj, key)) return obj[key];

        if (key.indexOf('.') < 0) {
            return obj.hasOwnProperty(key) ? obj[key] : value(dflt);
        }

        for (const segment of key.split('.')) {
            if (Arr.accessible(obj) && Arr.exists(obj, segment)) {
                obj = obj[segment];
            } else {
                return value(dflt);
            }
        }

        return obj;
    }

    /**
     * Check if an array has any elements or an object has any properties.
     *
     * @param {(Array|Object)} array
     * @returns {boolean}
     */
    public static empty(array: unknown[] | object): boolean {
        return !(
            Array.isArray(array) ? array.length : Object.keys(array).length
        );
    }

    /**
     * Check if an item or items exist in an array using "dot" notation.
     *
     * @param {?Object} obj
     * @param {?(Array|string)} keys
     * @returns {boolean}
     */
    public static has(obj?: object, keys?: string[] | string): boolean {
        if (isNullOrUndefined(keys)) return false;

        keys = Arr.wrap(keys) as string[];

        if (!obj) return false;

        if (!keys.length) return false;

        for (const key of keys) {
            let subKeyObj = obj;

            if (Arr.exists(obj, key)) continue;

            for (const segment of key.split('.')) {
                // eslint-disable-next-line max-depth
                if (Arr.accessible(subKeyObj) && Arr.exists(subKeyObj, segment)) {
                    subKeyObj = subKeyObj[segment];
                } else {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Get a subset of the items from the given array.
     *
     * @param {Object} obj
     * @param {(Array|string)} keys
     * @returns {Object}
     */
    public static only(obj: object, keys: unknown[] | string): object {
        keys = Arr.wrap(keys);

        return Object(keys).reduce((acc: object, key: string): object => {
            if (keys.includes(key)) acc[key] = obj[key];

            return acc;
        }, {});
    }

    /**
     * Pluck an array of values from an array.
     *
     * @param {Array} array
     * @param {(string|Array|null)} value
     * @param {?(string|Array)} key
     * @returns {Object}
     */
    public static pluck(array: object[], value: string | string[] | null, key?: string | string[]): unknown[] | object {
        [value, key] = Arr._explodePluckParameters(value, key);

        const results = isNullOrUndefined(key) ? [] : {};

        for (const item of array) {
            const itemValue = dataGet(item, value);

            // If the key is "null" or "undefined", we will just append the
            // value to the array and keep looping. Otherwise we will key the
            // array using the value of the key we received from the developer.
            // Then we'll return the final array form.
            if (isNullOrUndefined(key)) {
                (results as unknown[]).push(itemValue);
            } else {
                const itemKey = dataGet(item, key as string | string[]);

                results[itemKey] = itemValue;
            }
        }

        return results;
    }

    /**
     * Push an item onto the beginning of an array.
     *
     * @param {(Array|Object)} array
     * @param {mixed} value
     * @param {?string} key
     * @returns {(Array|Object)}
     */
    public static prepend(array: unknown[] | object, value: unknown, key?: string): unknown[] | object {
        if (isNullOrUndefined(key) && Array.isArray(array)) {
            array = [value, ...array];
        } else if (isObject(array)) {
            array = {...array, [key as string]: value};
        }

        return array;
    }

    /**
     * Get a value from the array, and remove it.
     *
     * @param {Object} obj
     * @param {string} key
     * @param {mixed} dflt
     * @returns {mixed}
     */
    public static pull(obj: object, key: string, dflt?: unknown): unknown {
        const value = Arr.get(obj, key, dflt);

        Arr.forget(obj, key);

        return value;
    }

    /**
     * Get one or a specified number of random values from an array.
     *
     * @param {Array} array
     * @param {?number} number
     * @returns {mixed}
     *
     * @throws {Error}
     */
    public static random(array: unknown[], number?: number): any {
        const requested = (isNullOrUndefined(number) ? 1 : number) as number;

        const count = array.length;

        if (requested > count) {
            throw new Error(`You requested ${requested} items, but there are only ${count} items available.`);
        }

        if (isNullOrUndefined(number)) {
            return array[Math.floor(Math.random() * array.length)];
        }

        if (number === 0) return [];

        const keys = Arr._shuffle(
            Array.from(Array(number as number), (x: undefined, i: number): number => i)
        );

        const results = [];

        for (const key of keys) results.push(array[key as number]);

        return results;
    }

    /**
     * Set an object item to a given value using "dot" notation.
     *
     * If no key is given to the method, the entire object will be replaced.
     *
     * @param {Object} obj
     * @param {(string|null)} key
     * @param {mixed} value
     * @returns {Object}
     */
    public static set(obj: object, key: string | null, value: unknown): object | unknown {
        if (key === null) return value;

        const keys = key.split('.');

        while (keys.length > 1) {
            key = keys.shift() as string;

            // If the key doesn't exist at this depth, we will just create an
            // empty array to hold the next value, allowing us to create the
            // arrays to hold final values at the correct depth. Then we'll keep
            // digging into the array.
            if (!obj.hasOwnProperty(key) || !isObject(obj[key])) {
                obj[key] = {};
            }

            obj = obj[key];
        }

        obj[keys.shift() as string] = value;

        return obj;
    }

    /**
     * Shuffle the given array and return the result.
     *
     * @param {Array} array
     * @param {?string} seed
     * @returns {Array}
     */
    public static shuffle(array: unknown[], seed?: string): unknown[] {
        if (isNullOrUndefined(seed)) {
            return Arr._shuffle(array);
        }

        const rand = new Rand(seed);
        array = [...array];
        array.sort((): number => Math.floor(rand.next() * 2 - 1));

        return array;
    }

    /**
     * If the given value is not an array and not null, wrap it in one.
     *
     * @param  {mixed}  value
     * @returns {Array}
     */
    public static wrap(value: unknown): any[] {
        if (isNullOrUndefined(value)) {
            return [];
        }

        return Array.isArray(value) ? [...value] : [value];
    }

    /**
     * Return a new array that contains the given number of shuffled elements
     * from the original array.
     *
     * @param {Array} array
     * @returns {Array}
     */
    private static _shuffle(array: unknown[]): unknown[] {
        array = [...array];

        let currentIndex = array.length;
        let temporaryValue: unknown;
        let randomIndex: number;

        // While there remain elements to shuffle
        while (currentIndex !== 0) {
            // Pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    /**
     * Explode the "value" and "key" arguments passed to "pluck".
     *
     * @param {(Array|string|null)} value
     * @param {?(Array|string)} key
     * @returns {Array}
     */
    private static _explodePluckParameters(value: string[] | string | null,
        key?: string[] | string): any {
        value = isString(value) ? value.split('.') : value;

        key = isNullOrUndefined(key) || Array.isArray(key) ? key : key!.split('.');

        return [value, key];
    }

    /**
     * Collapse an array of arrays into a single array.
     *
     * @param {Array} array
     * @returns {Array}
     */
    private static _collapseArray(array: unknown[]): unknown[] {
        let results: unknown[] = [];

        for (const values of array) {
            if (!Array.isArray(values)) continue;

            results = [...results, ...values];
        }

        return results;
    }

    /**
     * Collapse an object of objects into a single object.
     *
     * @param {Object} obj
     * @returns {Object}
     */
    private static _collapseObject(obj: object): object {
        let results: object = {};

        for (const key of Object.keys(obj)) {
            if (!isObject(obj[key])) continue;

            results = {...results, ...obj[key]};
        }

        return results;
    }

}

export default Arr;
