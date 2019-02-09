import {isUndefined} from '../Support/helpers';
import {INTERFACE_SYMBOLS} from '../constants/metadata';

class InterfaceFactory {

    /**
     * Define metadata for a given interface name.
     *
     * @param {string} name
     * @returns {Function}
     */
    public static make(name: string): any {
        const identifier = {name, key: Symbol(name)};

        // eslint-disable-next-line require-jsdoc
        function fn(target: any, propertyName: string, index: number): any {
            InterfaceFactory._initializeMetadata(target, propertyName);
            InterfaceFactory._checkMetadata(identifier, target, propertyName, index);
            InterfaceFactory._defineMetadata(identifier, target, propertyName, index);

            return target;
        }

        fn.key = identifier.key;

        return fn;
    }

    /**
     * Initialize metadata container if it doesn't exist yet.
     *
     * @param {*} target
     * @param {(string|undefined)} propertyName
     * @returns {void}
     */
    private static _initializeMetadata(target: any, propertyName?: string): void {
        if (!isUndefined(propertyName)
            && !Reflect.hasOwnMetadata(INTERFACE_SYMBOLS, target, propertyName)) {
            Reflect.defineMetadata(INTERFACE_SYMBOLS, new Map, target, propertyName);

            return;
        }

        if (!Reflect.hasOwnMetadata(INTERFACE_SYMBOLS, target)) {
            Reflect.defineMetadata(INTERFACE_SYMBOLS, new Map, target);
        }
    }

    /**
     * Perform some checks before attempting to define metadata.
     *
     * @param {Object} identifier
     * @param {*} target
     * @param {(string|undefined)} propertyKey
     * @param {number} position
     * @returns {void}
     *
     * @throws {Error}
     */
    private static _checkMetadata({name, key}: {name: string, key: string | symbol}, target: any, // eslint-disable-line
        propertyKey: string | undefined, position: number): void {
        const metadata = isUndefined(propertyKey)
            ? Reflect.getMetadata(INTERFACE_SYMBOLS, target)
            : Reflect.getMetadata(INTERFACE_SYMBOLS, target, propertyKey);

        if (metadata.has(position)) {
            throw new Error(`Cannot apply @${name} decorator to the same parameter multiple times.`);
        }

        if (Array.from(metadata.values()).find((_: any): boolean => _ === key)) {
            throw new Error(`Injecting the same [${name}] interface multiple times is redundant.`);
        }
    }

    /**
     * Define custom meta data in order to keep track of any interfaces in the
     * parameter list of a function.
     *
     * @param {Object} identifier
     * @param {*} target
     * @param {(string|undefined)} propertyKey
     * @param {number} position
     * @returns {void}
     */
    private static _defineMetadata(identifier: {name: string, key: string | symbol}, target: any, // eslint-disable-line
        propertyKey: string | undefined, position: number): void {
        if (propertyKey) {
            Reflect.getMetadata(INTERFACE_SYMBOLS, target, propertyKey)
                .set(position, identifier.key);

            return;
        }

        Reflect.getMetadata(INTERFACE_SYMBOLS, target)
            .set(position, identifier.key);
    }

}

export default InterfaceFactory;
