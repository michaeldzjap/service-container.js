import ParameterDescriptor from '@src/Parsing/Descriptors/ParameterDescriptor';
import {ReflectionClass, ReflectionParameter, ReflectionType} from '@src/Reflection';
import ReflectionClassStub, {DependencyStub} from '@helpers/Stubs/ReflectionClassStub';
import {Interface} from '@typings/.';

describe('ReflectionParameter', (): void => {
    const DATA_PROVIDER = [
        {
            param: new ParameterDescriptor({name: 'stub', type: DependencyStub, position: 0}),
            className: 'DependencyStub',
            name: 'stub',
            isNative: false
        },
        {
            param: new ParameterDescriptor({name: 'name', type: String, position: 1, value: 'Riley Martin'}),
            className: 'String',
            name: 'name',
            isNative: true
        },
        {
            param: new ParameterDescriptor({name: 'impl', type: Interface, position: 2}),
            className: 'Symbol(IReflectionClassContractStub)',
            name: 'impl',
            isNative: false
        }
    ];

    DATA_PROVIDER.forEach(({param, className, name, isNative}): void => {
        const reflector = new ReflectionParameter(ReflectionClassStub, param);

        it(`returns the declaring class of the reflected [${param.name}] parameter as a reflection class instance`, (): void => {
            const declaringClass = reflector.getDeclaringClass() as any;

            expect(declaringClass).toBeInstanceOf(ReflectionClass);
            expect(declaringClass.getName()).toBe('ReflectionClassStub');
        });

        it(`returns the type of the reflected [${param.name}] parameter as a reflection class instance`, (): void => {
            const type = reflector.getClass();

            expect(type).toBeInstanceOf(ReflectionClass);
            expect(type.getName()).toBe(className);
        });

        it(`returns the name of the reflected [${param.name}] parameter`, (): void => {
            expect(reflector.getName()).toBe(name);
        });

        it(`returns the type of the reflected [${param.name}] parameter`, (): void => {
            const type = reflector.getType();

            expect(type).toBeInstanceOf(ReflectionType);
            expect(type.isBuiltin()).toBe(isNative);
        });
    });
});
