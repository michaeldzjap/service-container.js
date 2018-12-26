import Arr from './Arr';
import {Instantiable, Instance} from './types';

/**
 * Determine if the given value is undefined.
 *
 * @param {*} value
 * @returns {boolean}
 */
export const isUndefined = (value: unknown): value is undefined => (
    typeof value === 'undefined'
);

/**
 * Determine if the given value is null.
 *
 * @param {*} value
 * @returns {boolean}
 */
export const isNull = (value: unknown): value is null => value === null;

/**
 * Determine if the given value is null or undefined.
 *
 * @param {*} value
 * @returns {boolean}
 */
export const isNullOrUndefined = (value: unknown): value is null | undefined => (
    isNull(value) || isUndefined(value)
);

/**
 * Determine if the given value is an object.
 *
 * @param {*} value
 * @returns {boolean}
 */
export const isObject = (value: any): value is object => (
    typeof value === 'object' && value !== null
);

/**
 * Determine if the given value is a string.
 *
 * @param {*} value
 * @returns {boolean}
 */
export const isString = (value: any): value is string => (
    typeof value === 'string' || value instanceof String
);

/**
 * Determine if the given value is a map.
 *
 * @param {*} value
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
 * @param {*} target
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
 * @param {*} target
 * @returns {boolean}
 */
export const isSymbol = (target: any): target is Symbol => (
    typeof target === 'symbol'
);

/**
 * Determine if the given target has a prototype.
 *
 * @param {*} target
 * @returns {boolean}
 */
export const hasPrototype = (target: object | Function): target is Function => (
    target.hasOwnProperty('prototype')
);

/**
 * Determine if the given target has a constructor.
 *
 * @param {*} target
 * @returns {boolean}
 */
export const hasConstructor = (target: object | Function): target is object => (
    target.hasOwnProperty('constructor')
);

/**
 * Determine if the given target is instantiable.
 *
 * @param {*} target
 * @returns {boolean}
 */
export const isInstantiable = <T>(target: any): target is Instantiable<T> => (
    hasPrototype(target)
);

/**
 * Determine if the given target is an instance.
 *
 * @param {*} target
 * @returns {boolean}
 */
export const isInstance = <T>(target: any): target is Instance<T> => (
    !hasPrototype(target) && hasConstructor(target)
);

/**
 * Attempt to get the name of an object or function.
 *
 * @param {(Object|Function)} target
 * @returns {(string|undefined)}
 */
export const getName = (target: object | Function): string | undefined => {
    if (hasPrototype(target)) return target.name;

    return target.constructor.name;
};

/**
 * Strip off the "Symbol()" part of a stringified symbol.
 *
 * @param {symbol} target
 * @returns {string}
 */
export const getSymbolName = (target: symbol): string => {
    const result = /Symbol\(([^)]+)\)/.exec(target.toString());

    if (isNullOrUndefined(result)) {
        throw new Error('Could not determine interface name.');
    }

    return result[1];
};

/**
 * Return the default value of the given value.
 *
 * @param {*} value
 * @returns {*}
 */
export const value = (value: unknown): unknown => (
    value instanceof Function ? value() : value
);

/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param {*} target
 * @param {?(string[]|string)} key
 * @param {*} dflt
 * @returns {*}
 */
export const dataGet = (target: any, key: string[] | string | null, dflt?: unknown): any => {
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
