import Callable from '@src/Container/Callable';
import Container from '@src/Container/Container';
import {ContainerContractStub} from '@helpers/Contracts/ContainerContractStub';
import {
    ContainerConcreteStub,
    ContainerDefaultValueStub,
    ContainerDependentStub,
    ContainerImplementationStub,
    ContainerImplementationStubTwo,
    ContainerInjectVariableStub,
    ContainerInjectVariableStubWithInterfaceImplementation,
    ContainerLazyExtendStub,
    ContainerMixedPrimitiveStub,
    ContainerNestedDependentStub,
    ContainerStaticMethodStub,
    ContainerTestCallStub,
    ContainerTestContextInjectInstantiations,
    ContainerTestContextInjectOne,
    ContainerTestContextInjectTwo,
    ContainerTestContextInjectThree
} from '@helpers/Stubs/ContainerStubs';

describe('Container', (): void => {
    test('container singleton', (): void => {
        const container = Container.setInstance(new Container);

        expect(container).toBe(Container.getInstance());

        Container.setInstance();

        const container2 = Container.getInstance();

        expect(container2).toBeInstanceOf(Container);
        expect(container).not.toBe(container2);
    });

    test('closure resolution', (): void => {
        const container = new Container;
        container.bind('name', (): string => 'Riley Martin');

        expect(container.make('name')).toBe('Riley Martin');
    });

    test('bind if doesn\'t register if service already registered', (): void => {
        const container = new Container;
        container.bind('name', (): string => 'Riley Martin');
        container.bindIf('name', (): string => 'Eric the Actor');

        expect(container.make('name')).toBe('Riley Martin');
    });

    test('bind if does register if service not registered yet', (): void => {
        const container = new Container;
        container.bind('surname', (): string => 'Riley Martin');
        container.bindIf('name', (): string => 'Eric the Actor');

        expect(container.make('name')).toBe('Eric the Actor');
    });

    test('shared closure resolution', (): void => {
        const container = new Container;
        const obj = {};
        container.singleton('obj', (): object => obj);

        expect(container.make('obj')).toBe(obj);
    });

    test('auto concrete resolution', (): void => {
        const container = new Container;

        expect(container.make(ContainerConcreteStub)).toBeInstanceOf(ContainerConcreteStub);
    });

    test('shared concrete resolution', (): void => {
        const container = new Container;
        container.singleton(ContainerConcreteStub);

        const var1 = container.make(ContainerConcreteStub);
        const var2 = container.make(ContainerConcreteStub);

        expect(var1).toBe(var2);
    });

    test('abstract to concrete resolution', (): void => {
        const container = new Container;
        container.bind(ContainerContractStub.key, ContainerImplementationStub);
        const instance = container.make(ContainerDependentStub);

        expect(instance.impl).toBeInstanceOf(ContainerImplementationStub);
    });

    test('nested dependency resolution', (): void => {
        const container = new Container;
        container.bind(ContainerContractStub.key, ContainerImplementationStub);
        const instance = container.make(ContainerNestedDependentStub);

        expect(instance.inner).toBeInstanceOf(ContainerDependentStub);
        expect(instance.inner.impl).toBeInstanceOf(ContainerImplementationStub);
    });

    test('container is passed to resolvers', (): void => {
        const container = new Container;
        container.bind<string, Function>('something', (_: any): any => _);
        const c = container.make<string>('something');

        expect(c).toBe(container);
    });

    test('aliases', (): void => {
        const container = new Container;
        container.bind<string, Function>('foo', (): string => 'bar');
        container.alias<string, string>('foo', 'baz');
        container.alias<string, string>('baz', 'bat');

        expect(container.make<string>('foo')).toBe('bar');
        expect(container.make<string>('baz')).toBe('bar');
        expect(container.make<string>('bat')).toBe('bar');
    });

    test('aliases with array of parameters', (): void => {
        const container = new Container;
        container.bind<string, Function>(
            'foo',
            (app: Container, config: number[]): number[] => config
        );
        container.alias('foo', 'baz');

        expect(container.make('baz', [1, 2, 3])).toEqual([1, 2, 3]);
    });

    test('bindings can be overridden', (): void => {
        const container = new Container;
        container.set<string, string>('foo', 'bar');
        container.set<string, string>('foo', 'baz');

        expect(container.make('foo')).toBe('baz');
    });

    test('extended bindings', (): void => {
        let container = new Container;
        container.set<string, string>('foo', 'foo');
        container.extend('foo', (old: string, container: Container): string => {
            return `${old}bar`;
        });

        expect(container.make('foo')).toBe('foobar');

        container = new Container;
        container.singleton('foo', (): object => ({name: 'Riley Martin'}));
        container.extend('foo', (old: any, container: Container): object => {
            old.age = 69;

            return old;
        });

        const result = container.make('foo');

        expect(result.name).toBe('Riley Martin');
        expect(result.age).toBe(69);
        expect(container.make('foo')).toBe(result);
    });

    test('multiple extends', (): void => {
        const container = new Container;
        container.set<string, string>('foo', 'foo');
        container.extend('foo', (old: string, container: Container): string => (
            `${old}bar`
        ));
        container.extend('foo', (old: string, container: Container): string => (
            `${old}baz`
        ));

        expect(container.make('foo')).toBe('foobarbaz');
    });

    test('binding an instance returns the instance', (): void => {
        const container = new Container;
        const bound = {};
        const resolved = container.instance('foo', bound);

        expect(resolved).toBe(bound);
    });

    test('extend instances are preserved', (): void => {
        const container = new Container;
        container.bind('foo', (): object => ({foo: 'bar'}));
        container.instance('foo', {foo: 'foo'});
        container.extend('foo', (obj: any, container: Container): object => {
            obj.bar = 'baz';

            return obj;
        });
        container.extend('foo', (obj: any, container: Container): object => {
            obj.baz = 'foo';

            return obj;
        });

        expect(container.make('foo').foo).toBe('foo');
        expect(container.make('foo').bar).toBe('baz');
        expect(container.make('foo').baz).toBe('foo');
    });

    test('extend is lazy initialized', (): void => {
        ContainerLazyExtendStub.initialized = false;

        const container = new Container;
        container.bind(ContainerLazyExtendStub);
        container.extend(
            ContainerLazyExtendStub,
            (obj: ContainerLazyExtendStub, container: Container): ContainerLazyExtendStub => {
                obj.init();

                return obj;
            }
        );

        expect(ContainerLazyExtendStub.initialized).toBeFalsy();

        container.make(ContainerLazyExtendStub);

        expect(ContainerLazyExtendStub.initialized).toBeTruthy();
    });

    test('extend can be called before bind', (): void => {
        const container = new Container;
        container.extend('foo', (old: string, container: Container): string => `${old}bar`);
        container.set<string, string>('foo', 'foo');

        expect(container.make('foo')).toBe('foobar');
    });

    test('extend instance rebinding callback', (): void => {
        let rebind = false;

        const container = new Container;
        container.rebinding('foo', (): void => {
            rebind = true;
        });

        container.instance('foo', {});
        container.extend('foo', (obj: object, container: Container): object => obj);

        expect(rebind).toBeTruthy();
    });

    test('extend bind rebinding callback', (): void => {
        let rebind = false;

        const container = new Container;
        container.rebinding('foo', (): void => {
            rebind = true;
        });
        container.bind('foo', (): object => ({}));

        expect(rebind).toBeFalsy();

        container.make('foo');
        container.extend('foo', (obj: object, container: Container): object => obj);

        expect(rebind).toBeTruthy();
    });

    test('unset extend', (): void => {
        const container = new Container;
        container.bind('foo', (): object => ({foo: 'bar'}));

        container.extend('foo', (obj: any, container: Container): object => {
            obj.bar = 'baz';

            return obj;
        });

        container.unbind('foo');
        container.forgetExtenders('foo');

        container.bind('foo', (): string => 'foo');

        expect(container.make('foo')).toBe('foo');
    });

    test('resolution of default parameters', (): void => {
        const container = new Container;
        const instance = container.make(ContainerDefaultValueStub);

        expect(instance.stub).toBeInstanceOf(ContainerConcreteStub);
        expect(instance.dflt).toBe('Riley Martin');
    });

    test('resolving callbacks are called for specific abstracts', (): void => {
        const container = new Container;
        container.resolving('foo', (obj: any): object => {
            obj.name = 'Riley Martin';

            return obj;
        });
        container.bind('foo', (): object => ({}));
        const instance = container.make('foo');

        expect(instance.name).toBe('Riley Martin');
    });

    test('resolving callbacks are called', (): void => {
        const container = new Container;
        container.resolving((obj: any): object => {
            obj.name = 'Riley Martin';

            return obj;
        });
        container.bind('foo', (): object => ({}));
        const instance = container.make('foo');

        expect(instance.name).toBe('Riley Martin');
    });

    test('resolving callbacks are called for type', (): void => {
        const container = new Container;
        container.resolving(Object, (obj: any): object => {
            obj.name = 'Riley Martin';

            return obj;
        });
        container.bind('foo', (): object => ({}));
        const instance = container.make('foo');

        expect(instance.name).toBe('Riley Martin');
    });

    test('unset remove bound instances', (): void => {
        const container = new Container;
        container.instance<string, object>('object', {});
        container.unbind<string>('object');

        expect(container.bound<string>('object')).toBeFalsy();
    });

    test('bound instance and alias check via array access', (): void => {
        const container = new Container;
        container.instance<string, object>('object', {});
        container.alias<string, string>('object', 'alias');

        expect(container.get('object')).toBeTruthy();
        expect(container.get('alias')).toBeTruthy();
    });

    test('rebound listeners', (): void => {
        let rebind = false;

        const container = new Container;
        container.bind('foo', (): void => {});
        container.rebinding('foo', (): void => {
            rebind = true;
        });
        container.bind('foo', (): void => {});

        expect(rebind).toBeTruthy();
    });

    test('rebound listeners on instances', (): void => {
        let rebind = false;

        const container = new Container;
        container.instance('foo', (): void => {});
        container.rebinding('foo', (): void => {
            rebind = true;
        });
        container.instance('foo', (): void => {});

        expect(rebind).toBeTruthy();
    });

    test('rebound listeners on instances only fires if was already bound', (): void => {
        let rebind = false;

        const container = new Container;
        container.rebinding('foo', (): void => {
            rebind = true;
        });
        container.instance('foo', (): void => {});

        expect(rebind).toBeFalsy();
    });

    test('internal class with default parameters', (): void => {
        const container = new Container;

        // eslint-disable-next-line require-jsdoc
        const fn = (): void => container.make(ContainerMixedPrimitiveStub, []);

        expect(fn).toThrow('Unresolvable dependency resolving [first] in class ContainerMixedPrimitiveStub');
    });

    test('binding resolution error message', (): void => {
        const container = new Container;

        // eslint-disable-next-line require-jsdoc
        const fn = (): void => container.make(ContainerContractStub.key, []);

        expect(fn).toThrow('Target [ContainerContractStub] is not instantiable.');
    });

    test('binding resolution error message includes build stack', (): void => {
        const container = new Container;

        // eslint-disable-next-line require-jsdoc
        const fn = (): void => container.make(ContainerTestContextInjectOne, []);

        expect(fn).toThrow('Target [ContainerContractStub] is not instantiable while building [ContainerTestContextInjectOne].');
    });

    test('call with class references without method throws error', (): void => {
        const container = new Container;

        // eslint-disable-next-line require-jsdoc
        const fn = (): void => container.call(new Callable(ContainerTestCallStub));

        expect(fn).toThrow('Method not provided.');
    });

    test('call with class references', (): void => {
        let container = new Container;
        let result = container.call(
            new Callable(ContainerTestCallStub, 'work'), ['foo', 'bar']
        );
        expect(result).toEqual(['foo', 'bar']);

        container = new Container;
        result = container.call(new Callable(ContainerTestCallStub, 'inject'));
        expect(result[0]).toBeInstanceOf(ContainerConcreteStub);
        expect(result[1]).toBe('Riley Martin');

        container = new Container;
        result = container.call(
            new Callable(ContainerTestCallStub, 'inject'), {dflt: 'foo'}
        );
        expect(result[0]).toBeInstanceOf(ContainerConcreteStub);
        expect(result[1]).toBe('foo');

        container = new Container;
        result = container.call(
            new Callable(ContainerTestCallStub), ['foo', 'bar'], 'work'
        );
        expect(result).toEqual(['foo', 'bar']);
    });

    test('call with callable instance', (): void => {
        const container = new Container;
        const stub = new ContainerTestCallStub;
        const result = container.call(new Callable(stub, 'work'), ['foo', 'bar']);

        expect(result).toEqual(['foo', 'bar']);
    });

    test('call with static method name', (): void => {
        const container = new Container;
        const result = container.call(
            new Callable(ContainerStaticMethodStub, 'inject', true)
        );

        expect(result[0]).toBeInstanceOf(ContainerConcreteStub);
        expect(result[1]).toBe('Riley Martin');
    });

    test('call with bound method', (): void => {
        let container = new Container;
        container.bindMethod(
            'ContainerTestCallStub@unresolvable',
            (stub: ContainerTestCallStub): unknown[] => stub.unresolvable('foo', 'bar')
        );
        let result = container.call(
            new Callable(ContainerTestCallStub, 'unresolvable')
        );
        expect(result).toEqual(['foo', 'bar']);

        container = new Container;
        container.bindMethod(
            'ContainerTestCallStub@unresolvable',
            (stub: ContainerTestCallStub): unknown[] => stub.unresolvable('foo', 'bar')
        );
        result = container.call(
            new Callable(new ContainerTestCallStub, 'unresolvable')
        );
        expect(result).toEqual(['foo', 'bar']);
    });

    test('bind method accepts an array', (): void => {
        const container = new Container;
        container.bindMethod(
            [ContainerTestCallStub, 'unresolvable'],
            (stub: ContainerTestCallStub): unknown[] => stub.unresolvable('foo', 'bar')
        );
        const result = container.call(
            new Callable(ContainerTestCallStub, 'unresolvable')
        );

        expect(result).toEqual(['foo', 'bar']);
    });

    test('container can inject different implementations depending on context', (): void => {
        let container = new Container;

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.when(ContainerTestContextInjectOne)
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStub);
        container.when(ContainerTestContextInjectTwo)
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStubTwo);

        let one = container.make(ContainerTestContextInjectOne);
        let two = container.make(ContainerTestContextInjectTwo);

        expect(one.impl).toBeInstanceOf(ContainerImplementationStub);
        expect(two.impl).toBeInstanceOf(ContainerImplementationStubTwo);

        /*
         * Test With Closures
         */
        container = new Container;

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.when(ContainerTestContextInjectOne)
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStub);
        container.when(ContainerTestContextInjectTwo)
            .needs(ContainerContractStub.key)
            .give((container: Container): ContainerImplementationStubTwo => (
                container.make(ContainerImplementationStubTwo)
            ));

        one = container.make(ContainerTestContextInjectOne);
        two = container.make(ContainerTestContextInjectTwo);

        expect(one.impl).toBeInstanceOf(ContainerImplementationStub);
        expect(two.impl).toBeInstanceOf(ContainerImplementationStubTwo);
    });

    test('contextual binding works for existing instanced bindings', (): void => {
        const container = new Container;

        container.instance(ContainerContractStub.key, new ContainerImplementationStub);

        container.when(ContainerTestContextInjectOne)
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStubTwo);

        expect(container.make(ContainerTestContextInjectOne).impl)
            .toBeInstanceOf(ContainerImplementationStubTwo);
    });

    test('contextual binding works for newly instanced bindings', (): void => {
        const container = new Container;

        container.when(ContainerTestContextInjectOne)
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStubTwo);

        container.instance(ContainerContractStub.key, new ContainerImplementationStub);

        expect(container.make(ContainerTestContextInjectOne).impl)
            .toBeInstanceOf(ContainerImplementationStubTwo);
    });

    test('contextual binding works on existing aliased instances', (): void => {
        const container = new Container;

        container.instance('stub', new ContainerImplementationStub);
        container.alias('stub', ContainerContractStub.key);

        container.when(ContainerTestContextInjectOne)
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStubTwo);

        expect(container.make(ContainerTestContextInjectOne).impl)
            .toBeInstanceOf(ContainerImplementationStubTwo);
    });

    test('contextual binding works on new aliased instances', (): void => {
        const container = new Container;

        container.when(ContainerTestContextInjectOne)
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStubTwo);

        container.instance('stub', new ContainerImplementationStub);
        container.alias('stub', ContainerContractStub.key);

        expect(container.make(ContainerTestContextInjectOne).impl)
            .toBeInstanceOf(ContainerImplementationStubTwo);
    });

    test('contextual binding works on new aliased bindings', (): void => {
        const container = new Container;

        container.when(ContainerTestContextInjectOne)
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStubTwo);

        container.bind('stub', ContainerImplementationStub);
        container.alias('stub', ContainerContractStub.key);

        expect(container.make(ContainerTestContextInjectOne).impl)
            .toBeInstanceOf(ContainerImplementationStubTwo);
    });

    test('contextual binding works for multiple classes', (): void => {
        const container = new Container;

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.when([ContainerTestContextInjectTwo, ContainerTestContextInjectThree])
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStubTwo);

        expect(container.make(ContainerTestContextInjectOne).impl)
            .toBeInstanceOf(ContainerImplementationStub);
        expect(container.make(ContainerTestContextInjectTwo).impl)
            .toBeInstanceOf(ContainerImplementationStubTwo);
        expect(container.make(ContainerTestContextInjectThree).impl)
            .toBeInstanceOf(ContainerImplementationStubTwo);
    });

    test('contextual binding doesnt override contextual resolution', (): void => {
        const container = new Container;

        container.instance('stub', new ContainerImplementationStub);
        container.alias('stub', ContainerContractStub.key);

        container.when(ContainerTestContextInjectTwo)
            .needs(ContainerContractStub.key)
            .give(ContainerImplementationStubTwo);

        expect(container.make(ContainerTestContextInjectTwo).impl)
            .toBeInstanceOf(ContainerImplementationStubTwo);
        expect(container.make(ContainerTestContextInjectOne).impl)
            .toBeInstanceOf(ContainerImplementationStub);
    });

    test('contextually bound instances are not unnecessarily recreated', (): void => {
        ContainerTestContextInjectInstantiations.instantiations = 0;

        const container = new Container;

        container.instance(ContainerContractStub.key, new ContainerImplementationStub);
        container.instance(ContainerTestContextInjectInstantiations, new ContainerTestContextInjectInstantiations);

        expect(ContainerTestContextInjectInstantiations.instantiations).toBe(1);

        container.when(ContainerTestContextInjectOne)
            .needs(ContainerContractStub.key)
            .give(ContainerTestContextInjectInstantiations);

        container.make(ContainerTestContextInjectOne);
        container.make(ContainerTestContextInjectOne);
        container.make(ContainerTestContextInjectOne);
        container.make(ContainerTestContextInjectOne);

        expect(ContainerTestContextInjectInstantiations.instantiations).toBe(1);
    });

    // eslint-disable-next-line max-statements
    test('container tags', (): void => {
        let container = new Container;
        container.tag(ContainerImplementationStub, ['foo', 'bar']);
        container.tag(ContainerImplementationStubTwo, ['foo']);

        expect(container.tagged('bar')).toHaveLength(1);
        expect(container.tagged('foo')).toHaveLength(2);

        let fooResults = [];
        for (const foo of container.tagged('foo')) {
            fooResults.push(foo);
        }

        const barResults = [];
        for (const bar of container.tagged('bar')) {
            barResults.push(bar);
        }

        expect(fooResults[0]).toBeInstanceOf(ContainerImplementationStub);
        expect(barResults[0]).toBeInstanceOf(ContainerImplementationStub);
        expect(fooResults[1]).toBeInstanceOf(ContainerImplementationStubTwo);

        container = new Container;
        container.tag([ContainerImplementationStub, ContainerImplementationStubTwo], ['foo']);

        expect(container.tagged('foo')).toHaveLength(2);

        fooResults = [];
        for (const foo of container.tagged('foo')) {
            fooResults.push(foo);
        }

        expect(fooResults[0]).toBeInstanceOf(ContainerImplementationStub);
        expect(fooResults[1]).toBeInstanceOf(ContainerImplementationStubTwo);

        expect(container.tagged('this_tag_does_not_exist')).toHaveLength(0);
    });

    test('tagged services are lazy loaded', (): void => {
        const stub = new ContainerImplementationStub;
        const makeMock = jest.fn().mockReturnValue(stub);
        const {make} = Container.prototype;
        Container.prototype.make = makeMock;
        const container = new Container;

        container.tag(ContainerImplementationStub, ['foo']);
        container.tag(ContainerImplementationStubTwo, ['foo']);

        const results = [];
        for (const foo of container.tagged('foo')) {
            results.push(foo);
            break;
        }

        expect(makeMock).toHaveBeenCalledTimes(1);
        expect(makeMock).toHaveReturnedWith(stub);
        expect(container.tagged('foo')).toHaveLength(2);
        expect(results[0]).toBeInstanceOf(ContainerImplementationStub);

        Container.prototype.make = make;
    });

    test('lazy loaded tagged services cannot be looped over multiple times', (): void => {
        const container = new Container;
        container.tag(ContainerImplementationStub, ['foo']);
        container.tag(ContainerImplementationStubTwo, ['foo']);

        const services = container.tagged('foo');

        let results = [];
        for (const foo of services) {
            results.push(foo);
        }

        expect(results[0]).toBeInstanceOf(ContainerImplementationStub);
        expect(results[1]).toBeInstanceOf(ContainerImplementationStubTwo);

        results = [];
        for (const foo of services) {
            results.push(foo);
        }

        expect(results[0]).toBeUndefined();
        expect(results[1]).toBeUndefined();
    });

    test('forget instance forgets instance', (): void => {
        const container = new Container;
        const containerConcreteStub = new ContainerConcreteStub;
        container.instance(ContainerConcreteStub, containerConcreteStub);

        expect(container.isShared(ContainerConcreteStub)).toBeTruthy();

        container.forgetInstance(ContainerConcreteStub);

        expect(container.isShared(ContainerConcreteStub)).toBeFalsy();
    });

    test('forget instances forgets all instances', (): void => {
        const container = new Container;
        const containerConcreteStub1 = new ContainerConcreteStub;
        const containerConcreteStub2 = new ContainerConcreteStub;
        const containerConcreteStub3 = new ContainerConcreteStub;
        container.instance('Instance1', containerConcreteStub1);
        container.instance('Instance2', containerConcreteStub2);
        container.instance('Instance3', containerConcreteStub3);

        expect(container.isShared('Instance1')).toBeTruthy();
        expect(container.isShared('Instance2')).toBeTruthy();
        expect(container.isShared('Instance3')).toBeTruthy();

        container.forgetInstances();

        expect(container.isShared('Instance1')).toBeFalsy();
        expect(container.isShared('Instance2')).toBeFalsy();
        expect(container.isShared('Instance3')).toBeFalsy();
    });

    test('container flush flushes all bindings aliases and resolved instances', (): void => {
        const container = new Container;
        container.bind('ConcreteStub', (): ContainerConcreteStub => (
            new ContainerConcreteStub
        ), true);
        container.alias('ConcreteStub', 'ContainerConcreteStub');
        container.make('ConcreteStub');

        expect(container.resolved('ConcreteStub')).toBeTruthy();
        expect(container.isAlias('ContainerConcreteStub')).toBeTruthy();
        expect(container.getBindings().has('ConcreteStub')).toBeTruthy();
        expect(container.isShared('ConcreteStub')).toBeTruthy();

        container.flush();

        expect(container.resolved('ConcreteStub')).toBeFalsy();
        expect(container.isAlias('ContainerConcreteStub')).toBeFalsy();
        expect(container.getBindings().size).toBe(0);
        expect(container.isShared('ConcreteStub')).toBeFalsy();
    });

    test('resolved resolves alias to binding name before checking', (): void => {
        const container = new Container;
        container.bind('ConcreteStub', (): ContainerConcreteStub => (
            new ContainerConcreteStub
        ), true);
        container.alias('ConcreteStub', 'foo');

        expect(container.resolved('ConcreteStub')).toBeFalsy();
        expect(container.resolved('foo')).toBeFalsy();

        container.make('ConcreteStub');

        expect(container.resolved('ConcreteStub')).toBeTruthy();
        expect(container.resolved('foo')).toBeTruthy();
    });

    test('get alias', (): void => {
        const container = new Container;
        container.alias('ConcreteStub', 'foo');

        expect(container.getAlias('foo')).toBe('ConcreteStub');
    });

    test('it throws error when abstract is same as alias', (): void => {
        const container = new Container;

        // eslint-disable-next-line require-jsdoc
        const fn = (): unknown => container.alias('name', 'name');

        expect(fn).toThrow('[name] is aliased to itself.');
    });

    test('container can inject simple variable', (): void => {
        let container = new Container;
        container.when(ContainerInjectVariableStub).needs('something').give(100);
        let instance = container.make(ContainerInjectVariableStub);

        expect(instance.something).toBe(100);

        container = new Container;
        container.when(ContainerInjectVariableStub)
            .needs('something')
            .give((container: Container): ContainerConcreteStub => (
                container.make(ContainerConcreteStub)
            ));
        instance = container.make(ContainerInjectVariableStub);

        expect(instance.something).toBeInstanceOf(ContainerConcreteStub);
    });

    test('container get factory', (): void => {
        const container = new Container;
        container.bind('name', (): string => 'Riley Martin');
        const factory = container.factory('name');

        expect(container.make('name')).toBe(factory());
    });

    test('extension works on aliased bindings', (): void => {
        const container = new Container;
        container.singleton('something', (): string => 'some value');
        container.alias('something', 'something-alias');
        container.extend('something-alias', (value: string): string => `${value} extended`);

        expect(container.make('something')).toBe('some value extended');
    });

    test('contextual binding works with aliased targets', (): void => {
        const container = new Container;

        container.bind(ContainerContractStub.key, ContainerImplementationStub);
        container.alias(ContainerContractStub.key, 'interface-stub');

        container.alias(ContainerImplementationStub, 'stub-1');

        container.when(ContainerTestContextInjectOne).needs('interface-stub').give('stub-1');
        container.when(ContainerTestContextInjectTwo).needs('interface-stub').give(ContainerImplementationStubTwo);

        const one = container.make(ContainerTestContextInjectOne);
        const two = container.make(ContainerTestContextInjectTwo);

        expect(one.impl).toBeInstanceOf(ContainerImplementationStub);
        expect(two.impl).toBeInstanceOf(ContainerImplementationStubTwo);
    });

    test('resolving callbacks should be fired when called with aliases', (): void => {
        const container = new Container;
        container.alias(Object, 'std');
        container.resolving('std', (obj: any): object => {
            obj.name = 'Riley Martin';

            return obj;
        });
        container.bind('foo', (): object => ({}));
        const instance = container.make('foo');

        expect(instance.name).toBe('Riley Martin');
    });

    test('resolving callbacks are called once for implementation', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(1);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(2);
    });

    test('global resolving callbacks are called once for implementation', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving((): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(1);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(2);
    });

    test('resolving callbacks are called once for singleton concretes', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);
        container.bind(ContainerImplementationStub);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(1);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(2);

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(3);
    });

    test('resolving callbacks can still be added after the first resolution', (): void => {
        const container = new Container;

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.make(ContainerImplementationStub);

        let callCounter = 0;
        container.resolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(1);
    });

    test('resolving callbacks are canceled when interface gets bound to some other concrete', (): void => {
        const container = new Container;

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        let callCounter = 0;
        container.resolving(ContainerImplementationStub, (): void => {
            callCounter++;
        });

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(1);

        container.bind(ContainerContractStub.key, ContainerImplementationStubTwo);
        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(1);
    });

    test('resolving callbacks are called once for string abstractions', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving('foo', (): void => {
            callCounter++;
        });

        container.bind('foo', ContainerImplementationStub);

        container.make('foo');
        expect(callCounter).toBe(1);

        container.make('foo');
        expect(callCounter).toBe(2);
    });

    test('resolving callbacks for concretes are called once for string abstractions', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerImplementationStub, (): void => {
            callCounter++;
        });

        container.bind('foo', ContainerImplementationStub);
        container.bind('bar', ContainerImplementationStub);
        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(1);

        container.make('foo');
        expect(callCounter).toBe(2);

        container.make('bar');
        expect(callCounter).toBe(3);

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(4);
    });

    test('resolving callbacks are called once for implementation 2', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, (): ContainerImplementationStub => (
            new ContainerImplementationStub
        ));

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(1);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(2);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(3);

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(4);
    });

    test('rebinding does not affect resolving callbacks', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);
        container.bind(ContainerContractStub.key, (): ContainerImplementationStub => (
            new ContainerImplementationStub
        ));

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(1);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(2);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(3);

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(4);
    });

    test('parameters passed into resolving callbacks', (): void => {
        const container = new Container;

        container.resolving(ContainerContractStub.key, (obj: ContainerImplementationStubTwo, app: Container): void => {
            expect(obj).toBeInstanceOf(ContainerImplementationStubTwo);
            expect(container).toEqual(app);
        });

        container.afterResolving(ContainerContractStub.key, (obj: ContainerImplementationStubTwo, app: Container): void => {
            expect(obj).toBeInstanceOf(ContainerImplementationStubTwo);
            expect(container).toEqual(app);
        });

        container.afterResolving((obj: ContainerImplementationStubTwo, app: Container): void => {
            expect(obj).toBeInstanceOf(ContainerImplementationStubTwo);
            expect(container).toEqual(app);
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStubTwo);
        container.make(ContainerContractStub.key);
    });

    test('resolving callbacks are called when rebind happens for resolved abstract', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(1);

        container.bind(ContainerContractStub.key, ContainerImplementationStubTwo);
        expect(callCounter).toBe(2);

        container.make(ContainerImplementationStubTwo);
        expect(callCounter).toBe(3);

        container.bind(ContainerContractStub.key, (): ContainerImplementationStubTwo => (
            new ContainerImplementationStubTwo
        ));
        expect(callCounter).toBe(4);

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(5);
    });

    test('rebinding does not affect multiple resolving callbacks', (): void => {
        const container = new Container;

        let callCounter = 0;

        container.resolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        container.resolving(ContainerImplementationStubTwo, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        // It should call the callback for interface
        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(1);

        // It should call the callback for interface
        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(2);

        // eslint-disable-next-line require-jsdoc
        const fn = (): void => {
            container.make(ContainerImplementationStubTwo);
        };

        // This should throw since it is impossible to determine if a class that
        // is not explicitly bounded to a contract / interface is implementing
        // this contract / interface
        expect(fn).toThrow('Impossible to determine if instance of [ContainerImplementationStubTwo] implements [ContainerContractStub].');
    });

    test('resolving callbacks are called for interfaces', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.make(ContainerContractStub.key);

        expect(callCounter).toBe(1);
    });

    test('resolving callbacks are called for concretes when attached on interface', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerImplementationStub, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(1);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(2);
    });

    test('resolving callbacks are called for concretes when attached on concretes', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerImplementationStub, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(1);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(2);
    });

    test('resolving callbacks are called for concretes with no binding', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerImplementationStub, (): void => {
            callCounter++;
        });

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(1);
        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(2);
    });

    test('resolving callbacks are not called for interfaces with no binding', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.resolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        // eslint-disable-next-line require-jsdoc
        const fn = (): void => {
            container.make(ContainerImplementationStub);
        };

        // This should throw since it is impossible to determine if a class that
        // is not explicitly bounded to a contract / interface is implementing
        // this contract / interface
        expect(fn).toThrow('Impossible to determine if instance of [ContainerImplementationStub] implements [ContainerContractStub].');
    });

    test('after resolving callbacks are called once for implementation', (): void => {
        const container = new Container;

        let callCounter = 0;
        container.afterResolving(ContainerContractStub.key, (): void => {
            callCounter++;
        });

        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        container.make(ContainerImplementationStub);
        expect(callCounter).toBe(1);

        container.make(ContainerContractStub.key);
        expect(callCounter).toBe(2);
    });

    test('resolving with array of parameters', (): void => {
        const container = new Container;
        let instance = container.make(ContainerDefaultValueStub, {dflt: 'Eric The Actor'});
        expect(instance.dflt).toBe('Eric The Actor');

        instance = container.make(ContainerDefaultValueStub);
        expect(instance.dflt).toBe('Riley Martin');

        container.bind('foo', (app: Container, config: number[]): number[] => config);

        expect(container.make('foo', [1, 2, 3])).toEqual([1, 2, 3]);
    });

    test('resolving with using an interface', (): void => {
        const container = new Container;
        container.bind(ContainerContractStub.key, ContainerInjectVariableStubWithInterfaceImplementation);
        const instance = container.make(ContainerContractStub.key, {something: 'Riley Martin'});

        expect(instance.something).toBe('Riley Martin');
    });

    test('nested parameter override', (): void => {
        const container = new Container;
        container.bind('foo', (app: Container, config: object): object => (
            app.make('bar', {name: 'Riley Martin'})
        ));
        container.bind('bar', (app: Container, config: object): object => config);

        expect(container.make('foo', ['something'])).toEqual({name: 'Riley Martin'});
    });

    test('nested parameters are reset for fresh make', (): void => {
        const container = new Container;

        container.bind<string, Function>('foo', (app: Container, config: string[]): [] => app.make('bar'));

        container.bind<string, Function>('bar', (app: Container, config: []): [] => config);

        expect(container.make<string>('foo', ['something'])).toEqual([]);
    });

    test('singleton bindings not respected with make parameters', (): void => {
        const container = new Container;

        container.singleton<string, Function>('foo', (app: Container, config: object): object => config);

        expect(container.make<string>('foo', {name: 'Riley Martin'}))
            .toEqual({name: 'Riley Martin'});
        expect(container.make<string>('foo', {name: 'Eric The Actor'}))
            .toEqual({name: 'Eric The Actor'});
    });

    test('can build without parameter stack with no constructors', (): void => {
        const container = new Container;

        expect(container.build(ContainerConcreteStub)).toBeInstanceOf(ContainerConcreteStub);
    });

    test('can build without parameter stack with constructors', (): void => {
        const container = new Container;
        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        expect(container.build(ContainerDependentStub)).toBeInstanceOf(ContainerDependentStub);
    });

    test('container knows entry', (): void => {
        const container = new Container;
        container.bind(ContainerContractStub.key, ContainerImplementationStub);

        expect(container.has(ContainerContractStub.key)).toBeTruthy();
    });

    test('container can bind any word', (): void => {
        const container = new Container;
        container.bind('Riley Martin', Object);

        expect(container.get('Riley Martin')).toBeInstanceOf(Object);
    });

    test('container can dynamically set service', (): void => {
        const container = new Container;

        expect(container.has('name')).toBeFalsy();

        container.set('name', 'Riley Martin');

        expect(container.has('name')).toBeTruthy();
        expect(container.get('name')).toBe('Riley Martin');
    });

    test('unknown entry throws exception', (): void => {
        const container = new Container;

        // eslint-disable-next-line require-jsdoc
        const fn = (): unknown => container.get('Riley Martin');

        expect(fn).toThrow(Error);
    });

    test('bound entries throws container error when not resolvable', (): void => {
        const container = new Container;
        container.bind('Riley Martin', ContainerContractStub.key);

        // eslint-disable-next-line require-jsdoc
        const fn = (): unknown => container.get('Riley Martin');

        expect(fn).toThrow('Target [ContainerContractStub] is not instantiable.');
    });

    test('container can resolve classes', (): void => {
        const container = new Container;
        const instance = container.get(ContainerConcreteStub);

        expect(instance).toBeInstanceOf(ContainerConcreteStub);
    });
});
