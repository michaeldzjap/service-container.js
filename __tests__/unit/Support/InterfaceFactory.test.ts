import InterfaceFactory from '@src/Support/InterfaceFactory';
import {INTERFACE_SYMBOLS} from '@src/constants/metadata';

const AContract = InterfaceFactory.make('Contract');
interface AContract {} // eslint-disable-line @typescript-eslint/no-empty-interface

const BContract = InterfaceFactory.make('Contract');
interface BContract {} // eslint-disable-line @typescript-eslint/no-empty-interface

describe('InterfaceFactory', (): void => {
    it('verifies that identically named interfaces have a unique identifier', (): void => {
        expect(AContract.key).not.toBe(BContract.key);
    });

    it('generates the correct metadata when decorating a method parameter', (): void => {
        class A {

            // eslint-disable-next-line no-useless-constructor
            public constructor(a: string, @AContract b: AContract) {
                //
            }

        }

        const metadata = Reflect.getMetadata(INTERFACE_SYMBOLS, A);

        expect(metadata.has(1)).toBeTruthy();
        expect(metadata.get(1)).toBe(AContract.key);
        expect(metadata.get(1)).not.toBe(BContract.key);
    });

    it('fails when attempting to decorate a method parameter multiple times', (): void => {
        // eslint-disable-next-line require-jsdoc
        const fn = (): void => {
            class A {

                // eslint-disable-next-line no-useless-constructor
                public constructor(@AContract@AContract a: AContract) {
                    //
                }

            }
        };

        expect(fn).toThrow('Cannot apply @Contract decorator to the same parameter multiple times.');
    });

    it('fails when attempting to apply the same decorator to multiple method parameters', (): void => {
        // eslint-disable-next-line require-jsdoc
        const fn = (): void => {
            class A {

                // eslint-disable-next-line no-useless-constructor
                public constructor(@AContract a: AContract, @AContract b: AContract) {
                    //
                }

            }
        };

        expect(fn).toThrow('Injecting the same [Contract] interface multiple times is redundant.');
    });
});
