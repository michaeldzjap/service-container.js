import Arr from './Arr';

/**
 * Set a property of an object to the given value.
 *
 * This method returns a shallow copy of the original object, where the property
 * denoted by the given key is replaced for the given value.
 *
 * @param {Object} target
 * @param {string} key
 * @param {mixed} value
 * @returns {Object}
 */
export const set = (target: object, key: string, value: any): object => ({
    ...target, [key]: value
});

/**
 * Remove a property from an object.
 *
 * This method returns a shallow copy of the original object that no longer
 * contains the property associated with the given key.
 *
 * @param {Object} target
 * @param {string} key
 * @returns {Object}
 */
export const remove = (target: any, key: string): object => {
    const {[key]: d, ...rest} = target;

    return rest;
};

/**
 * Determine if the given value is undefined.
 *
 * @param {mixed} value
 * @returns {boolean}
 */
export const isUndefined = (value: unknown): value is undefined => (
    typeof value === 'undefined'
);

/**
 * Determine if the given value is null.
 *
 * @param {mixed} value
 * @returns {boolean}
 */
export const isNull = (value: unknown): value is null => value === null;

/**
 * Determine if the given value is null or undefined.
 *
 * @param {mixed} value
 * @returns {boolean}
 */
export const isNullOrUndefined = (value: unknown): boolean => (
    isNull(value) || isUndefined(value)
);

/**
 * Determine if the given value is an object.
 *
 * @param {mixed} value
 * @returns {boolean}
 */
export const isObject = (value: any): value is object => (
    typeof value === 'object' && value !== null
);

/**
 * Determine if the given value is a string.
 *
 * @param {mixed} value
 * @returns {boolean}
 */
export const isString = (value: any): value is string => (
    typeof value === 'string' || value instanceof String
);

/**
 * Determine if the given value is a map.
 *
 * @param {mixed} value
 * @returns {boolean}
 */
export const isMap = (value: any): value is Map<unknown, unknown> => (
    value instanceof Map
);

/**
 * Return the last item in an array.
 *
 * @param {Array} array
 * @returns {mixed}
 */
export const last = (array: unknown[]): any => array[array.length - 1];

/**
 * Check if an array has any elements or an object has any properties.
 *
 * @param {Array|Object} target
 * @returns {boolean}
 */
export const empty = (target: Array<any> | Object): boolean => (
    !(Array.isArray(target) ? target.length : Object.keys(target).length)
);

/**
 * Since functions and class definitions are pretty much interchangeable in
 * JavaScript we need some custom way to make a distinction between a function
 * representing a class definition and an "ordinary" function. We will consider
 * unnamed functions or functions whose name start with a lowercase letter as an
 * "ordinary" function. This is not completely fail safe, but in light of this
 * project is considered an acceptable compromise.
 *
 * @param {mixed} target
 * @returns {boolean}
 */
export const isClass = (target: any): boolean => {
    if (typeof target !== 'function' || isNullOrUndefined(target.prototype)
        || target.prototype.constructor.name === '') {
        return false;
    }

    return target.prototype.constructor.name[0]
        === target.prototype.constructor.name[0].toUpperCase();
};

/**
 * Return the default value of the given value.
 *
 * @param {mixed} value
 * @returns {mixed}
 */
export const value = (value: unknown): unknown => (
    value instanceof Function ? value() : value
);

/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param {mixed} target
 * @param {string|Array|null} key
 * @param {mixed} dflt
 * @returns {mixed}
 */
export const dataGet = (target: any, key: string | string[] | null, dflt?: unknown): any => {
    if (isNullOrUndefined(key)) return target;

    key = Array.isArray(key) ? [...key] : key!.split('.');

    let segment = key.shift();
    while (!isNullOrUndefined(segment)) {
        if (segment === '*') {
            // eslint-disable-next-line max-depth
            if (!isObject(target)) return value(dflt);

            let result = {};

            // eslint-disable-next-line max-depth
            for (const item in target) {
                result = {...result, ...dataGet(item, key)};
            }

            return key.includes('*') ? Arr.collapse(result) : result;
        }

        if (Arr.accessible(target) && Arr.exists(target, segment as string)) {
            target = target[segment as string];
        } else {
            return value(dflt);
        }

        segment = key.shift();
    }

    return target;
};
