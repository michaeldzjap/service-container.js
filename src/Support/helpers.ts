import Arr from './Arr';
import {Instantiable, Instance} from '@typings/.';

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
export const isNullOrUndefined = (value: unknown): value is null | undefined => (
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
export const isClass = (target: any): target is Function => {
    if (typeof target !== 'function' || isNullOrUndefined(target.prototype)
        || target.prototype.constructor.name === '') {
        return false;
    }

    return target.prototype.constructor.name[0]
        === target.prototype.constructor.name[0].toUpperCase();
};

/**
 * Determine if the given target is a symbol.
 *
 * @param {mixed} target
 * @returns {boolean}
 */
export const isSymbol = (target: any): target is Symbol => (
    typeof target === 'symbol'
);

/**
 * Determine if the given target has a prototype.
 *
 * @param {mixed} target
 * @returns {boolean}
 */
export const hasPrototype = (target: any): boolean => (
    target.hasOwnProperty('prototype')
);

/**
 * Determine if the given target has a constructor.
 *
 * @param {mixed} target
 * @returns {boolean}
 */
export const hasConstructor = (target: any): boolean => (
    target.hasOwnProperty('constructor')
);

/**
 * Determine if the given target is instantiable.
 *
 * @param {mixed} target
 * @returns {boolean}
 */
export const isInstantiable = <T>(target: any): target is Instantiable<T> => (
    hasPrototype(target)
);

/**
 * Determine if the given target is an instance.
 *
 * @param {mixed} target
 * @returns {boolean}
 */
export const isInstance = <T>(target: any): target is Instance<T> => (
    !hasPrototype(target) && hasConstructor(target)
);

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
