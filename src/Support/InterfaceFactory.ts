import {isUndefined} from '../Support/helpers';
import {INTERFACE_SYMBOLS} from '../Constants/metadata';

class InterfaceFactory {

    /**
     * Define metadata for a given interface name.
     *
     * @param {string} name
     * @returns {Function}
     */
    public static make(name: string): any {
        const identifier = {name, key: Symbol.for(name)};

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
     * @param {mixed} target
     * @param {?string} propertyName
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
     * @param {mixed} target
     * @param {?string} propertyName
     * @param {number} position
     * @returns {void}
     *
     * @throws {Error}
     */
    private static _checkMetadata({name, key}: {name: string, key: Symbol | string}, target: any, // eslint-disable-line
        propertyName: string | undefined, position: number): void {
        const metadata = isUndefined(propertyName)
            ? Reflect.getMetadata(INTERFACE_SYMBOLS, target)
            : Reflect.getMetadata(INTERFACE_SYMBOLS, target, propertyName);

        if (metadata.has(position)) {
            throw new Error(`Cannot apply @${name} decorator to the same target multiple times.`);
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
     * @param {mixed} target
     * @param {?string} propertyName
     * @param {number} position
     * @returns {void}
     */
    private static _defineMetadata(identifier: {name: string, key: Symbol | string}, target: any, // eslint-disable-line
        propertyName: string | undefined, position: number): void {
        if (propertyName) {
            Reflect.defineMetadata(
                INTERFACE_SYMBOLS,
                Reflect.getMetadata(INTERFACE_SYMBOLS, target, propertyName)
                    .set(position, identifier.key),
                target,
                propertyName
            );

            return;
        }

        Reflect.defineMetadata(
            INTERFACE_SYMBOLS,
            Reflect.getMetadata(INTERFACE_SYMBOLS, target)
                .set(position, identifier.key),
            target
        );
    }

}

export default InterfaceFactory;
