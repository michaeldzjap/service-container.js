import 'reflect-metadata';

import {INTERFACE_SYMBOLS} from '@src/Constants/metadata';

/**
 * Initialize metadata container if it doesn't exist yet.
 *
 * @param {mixed} target
 * @param {string|undefined} propertyName
 * @returns {void}
 */
const initializeMetadata = (target: any, propertyName: string | undefined): void => {
    if (propertyName && !Reflect.hasOwnMetadata(INTERFACE_SYMBOLS, target, propertyName)) {
        Reflect.defineMetadata(INTERFACE_SYMBOLS, new Map, target, propertyName);

        return;
    }

    if (!Reflect.hasOwnMetadata(INTERFACE_SYMBOLS, target)) {
        Reflect.defineMetadata(INTERFACE_SYMBOLS, new Map, target);
    }
};

/**
 * Perform some checks before attempting to define metadata.
 *
 * @param {Object} identifier
 * @param {mixed} target
 * @param {string|undefined} propertyName
 * @param {number} position
 * @returns {void}
 *
 * @throws {Error}
 */
const checkMetadata = ({name, key}: {name: string, key: Symbol}, target: any,
    propertyName: string | undefined, position: number): void => {
    const metadata = propertyName
        ? Reflect.getMetadata(INTERFACE_SYMBOLS, target, propertyName)
        : Reflect.getMetadata(INTERFACE_SYMBOLS, target);

    if (metadata.has(position)) {
        throw new Error(`Cannot apply @${name} decorator to the same target multiple times.`);
    }

    if (Array.from(metadata.values()).find((_: Symbol): boolean => _ === key)) {
        throw new Error(`Injecting the same [${name}] interface multiple times is redundant.`);
    }
};

/**
 * Define custom meta data in order to keep track of any interfaces in the
 * parameter list of a function.
 *
 * @param {Object} identifier
 * @param {mixed} target
 * @param {string|undefined} propertyName
 * @param {number} position
 * @returns {void}
 */
const defineMetadata = (identifier: {name: string, key: Symbol}, target: any,
    propertyName: string | undefined, position: number): void => {
    if (propertyName) {
        Reflect.defineMetadata(
            INTERFACE_SYMBOLS,
            Reflect.getMetadata(INTERFACE_SYMBOLS, target, propertyName).set(position, identifier.key),
            target,
            propertyName
        );

        return;
    }

    Reflect.defineMetadata(
        INTERFACE_SYMBOLS,
        Reflect.getMetadata(INTERFACE_SYMBOLS, target).set(position, identifier.key),
        target
    );
};

/**
 * Define metadata for a given interface name.
 *
 * @param {string} name
 * @returns {Function}
 */
export default (name: string): any => {
    const identifier = {name, key: Symbol.for(name)};

    // eslint-disable-next-line require-jsdoc
    function fn(target: any, propertyName: string, index: number): any {
        initializeMetadata(target, propertyName);
        checkMetadata(identifier, target, propertyName, index);
        defineMetadata(identifier, target, propertyName, index);

        return target;
    }

    fn.key = identifier.key;

    return fn;
};
