import ReflectionClass from '@src/Reflection/ReflectionClass';
import ReflectionMethod from '@src/Reflection/ReflectionMethod';
import ReflectionParameter from '@src/Reflection/ReflectionParameter';
import ReflectionType from '@src/Reflection/ReflectionType';
import ReflectionClassStub from '@helpers/Stubs/ReflectionClassStub';

describe('ReflectionMethod', (): void => {
    const DATA_PROVIDER = [
        {name: 'publicMethod', isStatic: false},
        {name: '_privateMethod', isStatic: false},
        {name: 'publicStaticMethod', isStatic: true},
    ];

    DATA_PROVIDER.forEach(({name, isStatic}): void => {
        it(`returns the name of the reflected class method [${name}]`, (): void => {
            const reflector = new ReflectionMethod(ReflectionClassStub, name);

            expect(reflector.getName()).toBe(name);
        });

        it(`reflects the [${name}] method of a given class`, (): void => {
            const reflector = new ReflectionMethod(ReflectionClassStub, name);

            expect(reflector).toBeInstanceOf(ReflectionMethod);
            expect(reflector.getName()).toBe(name);
            expect(reflector.isStatic()).toBe(isStatic);
        });
    });

    it('returns the declaring class for the reflected method', (): void => {
        const reflector = new ReflectionMethod(ReflectionClassStub, 'constructor');
        const declaringClass = reflector.getDeclaringClass();

        expect(declaringClass).toBeInstanceOf(ReflectionClass);
        expect(declaringClass.getName()).toBe('ReflectionClassStub');
    });

    it('reflects the constructor of a given class', (): void => {
        const reflector = new ReflectionMethod(ReflectionClassStub, 'constructor');

        expect(reflector).toBeInstanceOf(ReflectionMethod);
        expect(reflector.getName()).toBe('constructor');
        expect(reflector.isConstructor()).toBeTruthy();
    });

    it('returns the parameters of a reflected constructor method', (): void => {
        const reflector = new ReflectionMethod(ReflectionClassStub, 'constructor');
        const parameters = reflector.getParameters();

        expect(parameters).toBeInstanceOf(Array);

        [
            {className: 'DependencyStub', name: 'stub'},
            {className: 'String', name: 'name', value: 'Riley Martin'},
            {className: 'ReflectionClassContractStub', name: 'impl'},
        ].forEach(({className, name, value}, i: number): void => {
            expect(parameters[i]).toBeInstanceOf(ReflectionParameter);
            expect(parameters[i].getType()).toBeInstanceOf(ReflectionType);

            if (parameters[i].getType().isBuiltin()) {
                expect(parameters[i].getClass()).toBeUndefined();
            } else {
                // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                expect(parameters[i].getClass()!.getName()).toBe(className);
            }

            expect(parameters[i].getName()).toBe(name);
            expect(parameters[i].getDefaultValue()).toBe(value);
        });
    });
});
