import isEqual from 'lodash.isequal';

import {accessible, collapse, exists} from './Arr';
import {Instantiable, Instance} from '../types/container';

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
 * Determine if the given target is a symbol.
 *
 * @param {*} target
 * @returns {boolean}
 */
export const isSymbol = (target: any): target is symbol => (
    typeof target === 'symbol'
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
 * Determine if the given target is a function.
 *
 * @param {*} target
 * @returns {boolean}
 */
export const isFunction = (target: any): target is Function => (
    typeof target === 'function'
);

/**
 * Determine if the given target has a prototype.
 *
 * @param {*} target
 * @returns {boolean}
 */
const hasPrototype = (target: object | Function): boolean => (
    Object.prototype.hasOwnProperty.call(target, 'prototype')
);

/**
 * Determine if the given target has a constructor.
 *
 * @param {*} target
 * @returns {boolean}
 */
const hasConstructor = (target: object | Function): target is object => (
    !isUndefined(target.constructor)
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
export const isInstantiable = <T>(target: any): target is Instantiable<T> => {
    if (typeof target !== 'function' || isUndefined(target.prototype)
        || target.prototype.constructor.name === '') {
        return false;
    }

    return target.prototype.constructor.name[0]
        === target.prototype.constructor.name[0].toUpperCase();
};

/**
 * Determine if the given target is an instance.
 *
 * @param {*} target
 * @returns {boolean}
 */
export const isInstance = <T>(target: any): target is Instance<T> => (
    !Array.isArray(target) && isObject(target) && !hasPrototype(target) && hasConstructor(target)
        && target.constructor.name !== 'Object'
);

/**
 * Check if two inputs are strictly equal.
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export const equals = (a: any, b: any): boolean => a === b;

/**
 * Determine the index of an element in the given array.
 *
 * @param {*} item
 * @param {Array} array
 * @param {boolean} [strict=false]
 * @returns {number}
 */
export const findIndex = (item: unknown, array: any[], strict = false): number => {
    if (strict) {
        return array.findIndex((_: unknown): boolean => _ === item);
    }

    return array.findIndex((_: unknown): boolean => {
        if (isObject(item) && isObject(_) || (Array.isArray(item)
            && Array.isArray(_))) {
            return isEqual(_, item);
        }

        return item == _; // eslint-disable-line eqeqeq
    });
};

/**
 * Determine the key of an element in the given object.
 *
 * @param {*} item
 * @param {Object} obj
 * @param {boolean} [strict=false]
 * @returns {(number|undefined)}
 */
export const findKey = (item: unknown, obj: object, strict = false): string | undefined => {
    const keys = Object.keys(obj);

    if (strict) {
        return keys.find((key: string): boolean => obj[key] === item);
    }

    return keys.find((key: string): boolean => {
        if (isObject(item) && isObject(obj[key]) || (Array.isArray(item)
            && Array.isArray(obj[key]))) {
            return isEqual(obj[key], item);
        }

        return item == obj[key]; // eslint-disable-line eqeqeq
    });
};

/**
 * Determine if an element is in the given array.
 *
 * @param {*} item
 * @param {Array} array
 * @param {boolean} [strict=false]
 * @returns {boolean}
 */
export const inArray = (item: any, array: any[], strict = false): boolean => {
    if (strict) {
        return array.includes(item);
    }

    return findIndex(item, array, strict) >= 0;
};

/**
 * Determine if an element is a property of the given object.
 *
 * @param {*} item
 * @param {Object} obj
 * @param {boolean} [strict=false]
 * @returns {boolean}
 */
export const inObject = (item: any, obj: object, strict = false): boolean => (
    inArray(item, Object.values(obj), strict)
);

/**
 * Strip off the "Symbol()" part of a stringified symbol.
 *
 * @param {symbol} target
 * @returns {string}
 */
export const getSymbolName = (target: symbol): string => {
    const result = /Symbol\(([^)]+)\)/.exec(target.toString());

    if (isNullOrUndefined(result)) {
        throw new Error('Could not determine name.');
    }

    return result[1];
};

/**
 * Attempt to get the name of an object or function.
 *
 * @param {*} target
 * @returns {(string|undefined)}
 */
export const getName = (target: any): string | undefined => {
    if (isFunction(target) && hasPrototype(target)) return target.name;

    if (isSymbol(target)) return getSymbolName(target);

    return target.constructor.name;
};

/**
 * Reverse the given string.
 *
 * @param {string} str
 * @returns {string}
 */
export const reverse = (str: string): string => (
    str.split('')
        .reverse()
        .join('')
);

/**
 * Return the default value of the given value.
 *
 * @param {*} value
 * @returns {*}
 */
export const value = (value: unknown): unknown => {
    return value instanceof Function ? value() : value;
};

/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param {*} target
 * @param {?(string[]|string|undefined)} key
 * @param {*} dflt
 * @returns {*}
 */
export const dataGet = (target: any, key?: string[] | string | null, dflt?: unknown): any => {
    if (isNullOrUndefined(key)) return target;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    key = Array.isArray(key) ? [...key] : key!.split('.');

    let segment = key.shift();
    while (!isUndefined(segment)) {
        if (segment === '*') {
            // eslint-disable-next-line max-depth
            if (!isObject(target)) return value(dflt);

            let result = {};

            // eslint-disable-next-line max-depth
            for (const item in target) {
                result = {...result, ...dataGet(item, key)};
            }

            return key.includes('*') ? collapse(result) : result;
        }

        if (accessible(target) && exists(target, segment)) {
            target = target[segment];
        } else {
            return value(dflt);
        }

        segment = key.shift();
    }

    return target;
};
