import ReflectionClass from '@src/Reflection/ReflectionClass';
import ReflectionMethod from '@src/Reflection/ReflectionMethod';
import ReflectionParameter from '@src/Reflection/ReflectionParameter';
import ReflectionType from '@src/Reflection/ReflectionType';
import ReflectionClassStub, {DependencyStub} from '@helpers/Stubs/ReflectionClassStub';

describe('ReflectionClass', (): void => {
    it('returns the name of the reflected class', (): void => {
        const reflector = new ReflectionClass(ReflectionClassStub);
        const name = reflector.getName();

        expect(name).toBe('ReflectionClassStub');
    });

    it('returns the constructor of the reflected class', (): void => {
        const reflector = new ReflectionClass(ReflectionClassStub);
        const constructor = reflector.getConstructor();

        expect(constructor).toBeInstanceOf(ReflectionMethod);
        expect(constructor.isConstructor()).toBeTruthy();
    });

    it('returns the constructor parameters of the reflected class', (): void => {
        const reflector = new ReflectionClass(ReflectionClassStub);
        const parameters = reflector.getConstructor().getParameters();

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

    it('creates a new instance of the reflected class with the given arguments', (): void => {
        const reflector = new ReflectionClass(ReflectionClassStub);
        const stub = reflector.newInstanceArgs([new DependencyStub, 'Riley Martin']);

        expect(stub).toBeInstanceOf(ReflectionClassStub);
    });
});
