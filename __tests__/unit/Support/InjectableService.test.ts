import InjectableService from '@src/Support/InjectableService';
import Interface from '@src/Support/Interface';
import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';
import {
    ClassWithConstructorStub,
    ClassWithPublicMethodStub,
    ClassWithPublicStaticMethodStub
} from '@helpers/Stubs/ParserStubs';
import {defineMetadata} from '@helpers/defineMetadata';
import {isUndefined} from '@src/Support/helpers';
import {PARAM_TYPES} from '@src/Constants/metadata';

const EXPECTED = [
    new ParameterDescriptor({name: 'a', type: Number, position: 0}),
    new ParameterDescriptor({name: 'b', type: String, position: 1, value: 'Hey now!'}),
    new ParameterDescriptor({name: 'c', type: Array, position: 2, value: [1, 2, 3]}),
    new ParameterDescriptor({name: 'd', type: Interface, position: 3}),
];

const TARGETS = [
    {target: ClassWithConstructorStub},
    {target: ClassWithPublicMethodStub.prototype, propertyKey: 'someMethod'},
    {target: ClassWithPublicStaticMethodStub, propertyKey: 'someMethod'},
];

// Ensure that type metadata exists for the given targets
defineMetadata(TARGETS, EXPECTED);

afterEach((): void => {
    // Ensure custom metadata no longer exists after executing each test
    TARGETS.forEach(({target, propertyKey}): void => {
        isUndefined(propertyKey)
            ? Reflect.deleteMetadata(PARAM_TYPES, target)
            : Reflect.deleteMetadata(PARAM_TYPES, target, propertyKey);
    });
});

describe('InjectableService', (): void => {
    it('generates parameter metadata for a class constructor', (): void => {
        InjectableService.defineMetadata(ClassWithConstructorStub);
        const metadata = Reflect.getMetadata(PARAM_TYPES, ClassWithConstructorStub);

        expect(metadata).toEqual(EXPECTED);
    });

    it('generates parameter metadata for an instance method', (): void => {
        InjectableService.defineMetadata(ClassWithPublicMethodStub.prototype, 'someMethod');
        const metadata = Reflect.getMetadata(
            PARAM_TYPES, ClassWithPublicMethodStub.prototype, 'someMethod'
        );

        expect(metadata).toEqual(EXPECTED);
    });

    it('generates parameter metadata for a static method', (): void => {
        InjectableService.defineMetadata(ClassWithPublicStaticMethodStub, 'someMethod');
        const metadata = Reflect.getMetadata(
            PARAM_TYPES, ClassWithPublicStaticMethodStub, 'someMethod'
        );

        expect(metadata).toEqual(EXPECTED);
    });

    it('fails to generate parameter metadata multiple times for the same target', (): void => {
        InjectableService.defineMetadata(ClassWithConstructorStub);

        // eslint-disable-next-line require-jsdoc
        const fn = (): void => {
            InjectableService.defineMetadata(ClassWithConstructorStub);
        };

        expect(fn).toThrow('Cannot apply @injectable decorator to the same target multiple times.');
    });
});
