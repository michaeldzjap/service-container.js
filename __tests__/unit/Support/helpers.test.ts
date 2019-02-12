import {
    isUndefined, isNull, isNullOrUndefined, isObject, isInstantiable, getName
} from '@src/Support/helpers';

interface DataItem {
    target: any;
    name: string;
    expected: boolean;
}

class ClassStub {}

const DATA = [
    {target: (): void => {}, name: 'arrow function'},
    {target: function (): void {}, name: 'unnamed function'}, // eslint-disable-line object-shorthand, no-empty-function
    {target(): void {}, name: 'named function'}, // eslint-disable-line no-empty-function
    {target: ClassStub, name: 'class definition'},
    {target: new ClassStub, name: 'class instance'},
    {target: String, name: 'built in class definition'},
    {target: {a: 1}, name: 'object instance'},
    {target: [1, 2, 3], name: 'array instance'},
    {target: 1, name: 'number'},
    {target: 'hey now!', name: 'string'},
];

describe('helpers', (): void => {
    [
        {expected: true},
        {value: null, expected: false},
        {value: 'something', expected: false},
    ].forEach(({value, expected}): void => {
        it(`determines if the value [${value}] is undefined`, (): void => {
            expect(isUndefined(value)).toBe(expected);
        });
    });

    [
        {expected: false},
        {value: null, expected: true},
        {value: 'something', expected: false},
    ].forEach(({value, expected}): void => {
        it(`determines if the value [${value}] is null`, (): void => {
            expect(isNull(value)).toBe(expected);
        });
    });

    [
        {expected: true},
        {value: null, expected: true},
        {value: 'something', expected: false},
    ].forEach(({value, expected}): void => {
        it(`determines if the value [${value}] is null or undefined`, (): void => {
            expect(isNullOrUndefined(value)).toBe(expected);
        });
    });

    [
        false, false, false, false, true, false, true, true, false, false,
    ].map((expected: boolean, index: number): DataItem => ({
        ...DATA[index], expected
    })).forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is an object`, (): void => {
            expect(isObject(target)).toBe(expected);
        });
    });

    [
        false, false, false, true, false, true, false, false, false, false,
    ].map((expected: boolean, index: number): DataItem => ({
        ...DATA[index], expected
    })).forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is instantiable`, (): void => {
            expect(isInstantiable(target)).toBe(expected);
        });
    });

    [
        {target: ClassStub},
        {target: ClassStub.prototype},
    ].forEach(({target}): void => {
        it('returns the name of the class', (): void => {
            const name = getName(target);

            expect(name).toBe('ClassStub');
        });
    });
});
