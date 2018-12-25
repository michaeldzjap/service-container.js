import ES5ClassAnalyser from '@src/Parsing/Analysers/es5/ClassAnalyser';
import ESNextClassAnalyser from '@src/Parsing/Analysers/esnext/ClassAnalyser';
import IClassAnalyser from '@src/Contracts/Parsing/IClassAnalyser';
import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';
import {
    ClassWithConstructorStub,
    ClassWithoutConstructorStub,
    ClassWithoutBodyStub,
    ClassWithPublicMethodStub,
    ClassWithPublicStaticMethodStub
} from '@helpers/Stubs/ParserStubs';
import {isUndefined} from '@src/Support/helpers';
import {Interface} from '@src/Support/types';
import {DESIGN_PARAM_TYPES} from '@src/Constants/metadata';
import * as ES5ClassWithConstructorStub from '@helpers/Stubs/es5/ClassWithConstructorStub.json';
import * as ESNextClassWithConstructorStub from '@helpers/Stubs/esnext/ClassWithConstructorStub.json';
import * as ES5ClassWithoutConstructorStub from '@helpers/Stubs/es5/ClassWithoutConstructorStub.json';
import * as ESNextClassWithoutConstructorStub from '@helpers/Stubs/esnext/ClassWithoutConstructorStub.json';
import * as ES5ClassWithoutBodyStub from '@helpers/Stubs/es5/ClassWithoutBodyStub.json';
import * as ESNextClassWithoutBodyStub from '@helpers/Stubs/esnext/ClassWithoutBodyStub.json';
import * as ES5ClassWithPublicMethodStub from '@helpers/Stubs/es5/ClassWithPublicMethodStub.json';
import * as ESNextClassWithPublicMethodStub from '@helpers/Stubs/esnext/ClassWithPublicMethodStub.json';
import * as ES5ClassWithPublicStaticMethodStub from '@helpers/Stubs/es5/ClassWithPublicStaticMethodStub.json';
import * as ESNextClassWithPublicStaticMethodStub from '@helpers/Stubs/esnext/ClassWithPublicStaticMethodStub.json';

const EXPECTED = [
    new ParameterDescriptor({name: 'a', type: Number, position: 0}),
    new ParameterDescriptor({name: 'b', type: String, position: 1, value: 'Hey now!'}),
    new ParameterDescriptor({name: 'c', type: Array, position: 2, value: [1, 2, 3]}),
    new ParameterDescriptor({name: 'd', type: Interface, position: 3}),
];

// Ensure that the type metadata exists for the given targets
[
    {target: ClassWithConstructorStub},
    {target: ClassWithPublicMethodStub.prototype, propertyKey: 'someMethod'},
    {target: ClassWithPublicStaticMethodStub, propertyKey: 'someMethod'},
].forEach(({target, propertyKey}): void => {
    if (!Reflect.hasMetadata(DESIGN_PARAM_TYPES, target)) {
        isUndefined(propertyKey)
            ? Reflect.defineMetadata(
                DESIGN_PARAM_TYPES,
                EXPECTED.map((_: ParameterDescriptor): any => _.type),
                target,
            )
            : Reflect.defineMetadata(
                DESIGN_PARAM_TYPES,
                EXPECTED.map((_: ParameterDescriptor): any => _.type),
                target,
                propertyKey
            );
    }
});

describe('ClassAnalyser', (): void => {
    [
        {
            version: 'es5',
            ast: [
                ES5ClassWithConstructorStub.body[0],
                ES5ClassWithoutConstructorStub.body[0],
                ES5ClassWithoutBodyStub.body[0],
            ],
            analyser: ES5ClassAnalyser
        },
        {
            version: 'esnext',
            ast: [
                ESNextClassWithConstructorStub.body[0],
                ESNextClassWithoutConstructorStub.body[0],
                ESNextClassWithoutBodyStub.body[0],
            ],
            analyser: ESNextClassAnalyser
        },
    ].forEach(({version, ast, analyser}): void => {
        describe(`version: ${version}`, (): void => {
            [
                {target: ClassWithConstructorStub, expected: true},
                {target: ClassWithoutConstructorStub, expected: false},
                {target: ClassWithoutBodyStub, expected: false},
            ].forEach(({target, expected}: {target: any, expected: boolean}, i: number): void => { // eslint-disable-line
                // eslint-disable-next-line max-nested-callbacks
                it(`verifies that the parsed class does${expected ? '' : ' not'} have a constructor`, (): void => {
                    const classAnalyser = new analyser(ast[i], target);
                    const result = classAnalyser.hasConstructor();

                    expect(result).toBe(expected);
                });
            });
        });
    });

    [
        {
            version: 'es5',
            ast: [
                ES5ClassWithConstructorStub.body[0],
                ES5ClassWithoutConstructorStub.body[0],
                ES5ClassWithoutBodyStub.body[0],
            ],
            analyser: ES5ClassAnalyser
        },
        {
            version: 'esnext',
            ast: [
                ESNextClassWithConstructorStub.body[0],
                ESNextClassWithoutConstructorStub.body[0],
                ESNextClassWithoutBodyStub.body[0],
            ],
            analyser: ESNextClassAnalyser
        },
    ].forEach(({version, ast, analyser}): void => {
        describe(`version: ${version}`, (): void => {
            [
                {target: ClassWithConstructorStub, expected: EXPECTED},
                {target: ClassWithoutConstructorStub},
                {target: ClassWithoutBodyStub},
            ].forEach(({target, expected}, i: number): void => {
                // eslint-disable-next-line max-nested-callbacks
                it(`returns the constructor parameters of the parsed [${target.name}] class`, (): void => {
                    const classAnalyser = new analyser(ast[i], target);
                    const result = classAnalyser.getConstructorParameters();

                    expect(result).toEqual(expected);
                });
            });
        });
    });

    [
        {
            version: 'es5',
            ast: ES5ClassWithPublicMethodStub.body[0],
            analyser: ES5ClassAnalyser
        },
        {
            version: 'esnext',
            ast: ESNextClassWithPublicMethodStub.body[0],
            analyser: ESNextClassAnalyser
        },
    ].forEach(({version, ast, analyser}): void => {
        describe(`version: ${version}`, (): void => {
            it('returns the method parameters of the parsed [ClassWithPublicMethodStub] class', (): void => {
                const classAnalyser = new analyser(ast, ClassWithPublicMethodStub.prototype);
                const result = classAnalyser.getMethodParameters('someMethod');

                expect(result).toEqual(EXPECTED);
            });
        });
    });

    [
        {
            version: 'es5',
            ast: ES5ClassWithPublicStaticMethodStub.body[0],
            analyser: ES5ClassAnalyser
        },
        {
            version: 'esnext',
            ast: ESNextClassWithPublicStaticMethodStub.body[0],
            analyser: ESNextClassAnalyser
        },
    ].forEach(({version, ast, analyser}): void => {
        describe(`version: ${version}`, (): void => {
            it('returns the method parameters of the parsed [ClassWithPublicStaticMethodStub] class', (): void => {
                const classAnalyser = new analyser(ast, ClassWithPublicStaticMethodStub);
                const result = classAnalyser.getMethodParameters('someMethod');

                expect(result).toEqual(EXPECTED);
            });
        });
    });
});
