import injectable from '@src/Support/injectable';
import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';
import {PARAM_TYPES} from '@src/Constants/metadata';

class SimpleStub {}

@injectable()
class InjectableStub {

    // eslint-disable-next-line no-useless-constructor
    public constructor(a: number, b: string = 'Hey now!', c: SimpleStub) {
        //
    }

    @injectable()
    public static someMethod(a: number, b: string = 'Hey now!', c: SimpleStub): void {
        //
    }

    @injectable()
    public someMethod(a: number, b: string = 'Hey now!', c: SimpleStub): void {
        //
    }

}

const EXPECTED = [
    new ParameterDescriptor({name: 'a', type: Number, position: 0}),
    new ParameterDescriptor({name: 'b', type: String, position: 1, value: 'Hey now!'}),
    new ParameterDescriptor({name: 'c', type: SimpleStub, position: 2}),
];

describe('@injectable', (): void => {
    it('generates parameter metadata for a class constructor', (): void => {
        const metadata = Reflect.getMetadata(PARAM_TYPES, InjectableStub);

        expect(metadata).toEqual(EXPECTED);
    });

    it('generates parameter metadata for an instance method', (): void => {
        const metadata = Reflect.getMetadata(PARAM_TYPES, InjectableStub.prototype, 'someMethod');

        expect(metadata).toEqual(EXPECTED);
    });

    it('generates parameter metadata for a static method', (): void => {
        const metadata = Reflect.getMetadata(PARAM_TYPES, InjectableStub, 'someMethod');

        expect(metadata).toEqual(EXPECTED);
    });
});
