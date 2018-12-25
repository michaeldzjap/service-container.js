import InterfaceFactory from '@src/Support/InterfaceFactory';
import {INTERFACE_SYMBOLS} from '@src/Constants/metadata';

const IA = InterfaceFactory.make('IContract');
interface IA {} // eslint-disable-line typescript/no-empty-interface

const IB = InterfaceFactory.make('IContract');
interface IB {} // eslint-disable-line typescript/no-empty-interface

describe('InterfaceFactory', (): void => {
    it('verifies that identically named interfaces have a unique identifier', (): void => {
        expect(IA.key).not.toBe(IB.key);
    });

    it('generates the correct metadata when decorating a method parameter', (): void => {
        class A {

            // eslint-disable-next-line no-useless-constructor
            public constructor(a: string, @IA b: IA) {
                //
            }

        }

        const metadata = Reflect.getMetadata(INTERFACE_SYMBOLS, A);

        expect(metadata.has(1)).toBeTruthy();
        expect(metadata.get(1)).toBe(IA.key);
        expect(metadata.get(1)).not.toBe(IB.key);
    });

    it('fails when attempting to decorate a method parameter multiple times', (): void => {
        try {
            class A {

                // eslint-disable-next-line no-useless-constructor
                public constructor(@IA@IA a: IA) {
                    //
                }

            }
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe('Cannot apply @IContract decorator to the same parameter multiple times.');
        }
    });

    it('fails when attempting to apply the same decorator to multiple method parameters', (): void => {
        try {
            class A {

                // eslint-disable-next-line no-useless-constructor
                public constructor(@IA a: IA, @IA b: IA) {
                    //
                }

            }
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe('Injecting the same [IContract] interface multiple times is redundant.');
        }
    });
});
