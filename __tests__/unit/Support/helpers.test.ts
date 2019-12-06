import {
    isUndefined, isNull, isNullOrUndefined, isObject, isString, isSymbol, isMap,
    isFunction, isInstantiable, isInstance, equals, findIndex, findKey, inArray,
    inObject, getSymbolName, getName, reverse, value, dataGet
} from '@src/Support/helpers';

interface DataItem {
    target: any;
    name: string;
    expected: boolean;
}

class ClassStub {}

const DATA = [
    {target: (): void => {}, name: 'arrow function'}, // eslint-disable-line @typescript-eslint/no-empty-function
    {target: function (): void {}, name: 'unnamed function'}, // eslint-disable-line object-shorthand, no-empty-function, @typescript-eslint/no-empty-function
    {target(): void {}, name: 'named function'}, // eslint-disable-line no-empty-function, @typescript-eslint/no-empty-function
    {target: ClassStub, name: 'class definition'},
    {target: new ClassStub, name: 'class instance'},
    {target: {a: 1}, name: 'object instance'},
    {target: [1, 2, 3], name: 'array instance'},
    {target: 1, name: 'number'},
    {target: 'hey now!', name: 'string'},
    {target: String, name: 'string class definition'},
    {target: String('hey now!'), name: 'string instance'},
    {target: Map, name: 'map class definition'},
    {target: new Map, name: 'map class instance'},
    {target: Symbol, name: 'symbol class definition'},
    {target: Symbol('hey now!'), name: 'symbol class instance'},
];

// eslint-disable-next-line max-statements
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
        {target: (): void => {}, name: 'arrow function', expected: false}, // eslint-disable-line @typescript-eslint/no-empty-function
        {target: function (): void {}, name: 'unnamed function', expected: false}, // eslint-disable-line object-shorthand, no-empty-function, @typescript-eslint/no-empty-function
        {target(): void {}, name: 'named function', expected: false}, // eslint-disable-line no-empty-function, @typescript-eslint/no-empty-function
        {target: ClassStub, name: 'class definition', expected: false},
        {target: new ClassStub, name: 'class instance', expected: true},
        {target: {a: 1}, name: 'object instance', expected: true},
        {target: [1, 2, 3], name: 'array instance', expected: true},
        {target: 1, name: 'number', expected: false},
        {target: 'hey now!', name: 'string', expected: false},
    ].forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is an object`, (): void => {
            expect(isObject(target)).toBe(expected);
        });
    });

    [
        {target: 1, name: 'number', expected: false},
        {target: 'hey now!', name: 'string', expected: true},
        {target: String, name: 'string class definition', expected: false},
        {target: String('hey now!'), name: 'string instance', expected: true},
        {target: Symbol, name: 'symbol class definition', expected: false},
        {target: Symbol('hey now!'), name: 'symbol class instance', expected: false},
    ].forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is a string`, (): void => {
            expect(isString(target)).toBe(expected);
        });
    });

    [
        {target: 1, name: 'number', expected: false},
        {target: 'hey now!', name: 'string', expected: false},
        {target: String, name: 'string class definition', expected: false},
        {target: String('hey now!'), name: 'string instance', expected: false},
        {target: Symbol, name: 'symbol class definition', expected: false},
        {target: Symbol('hey now!'), name: 'symbol class instance', expected: true},
    ].forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is a symbol`, (): void => {
            expect(isSymbol(target)).toBe(expected);
        });
    });

    [
        {target: {a: 1}, name: 'object instance', expected: false},
        {target: [1, 2, 3], name: 'array instance', expected: false},
        {target: Map, name: 'map class definition', expected: false},
        {target: new Map, name: 'map class instance', expected: true},
    ].forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is a map`, (): void => {
            expect(isMap(target)).toBe(expected);
        });
    });

    [
        {target: (): void => {}, name: 'arrow function', expected: true}, // eslint-disable-line @typescript-eslint/no-empty-function
        {target: function (): void {}, name: 'unnamed function', expected: true}, // eslint-disable-line object-shorthand, no-empty-function, @typescript-eslint/no-empty-function
        {target(): void {}, name: 'named function', expected: true}, // eslint-disable-line no-empty-function, @typescript-eslint/no-empty-function
        {target: {a: 1}, name: 'object instance', expected: false},
    ].forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is a function`, (): void => {
            expect(isFunction(target)).toBe(expected);
        });
    });

    [
        {target: (): void => {}, name: 'arrow function', expected: false}, // eslint-disable-line @typescript-eslint/no-empty-function
        {target: function (): void {}, name: 'unnamed function', expected: false}, // eslint-disable-line object-shorthand, no-empty-function, @typescript-eslint/no-empty-function
        {target(): void {}, name: 'named function', expected: false}, // eslint-disable-line no-empty-function, @typescript-eslint/no-empty-function
        {target: ClassStub, name: 'class definition', expected: true},
        {target: new ClassStub, name: 'class instance', expected: false},
        {target: {a: 1}, name: 'object instance', expected: false},
        {target: [1, 2, 3], name: 'array instance', expected: false},
        {target: 1, name: 'number', expected: false},
        {target: 'hey now!', name: 'string', expected: false},
        {target: String, name: 'string class definition', expected: true},
        {target: String('hey now!'), name: 'string instance', expected: false},
    ].forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is instantiable`, (): void => {
            expect(isInstantiable(target)).toBe(expected);
        });
    });

    [
        {target: (): void => {}, name: 'arrow function', expected: false}, // eslint-disable-line @typescript-eslint/no-empty-function
        {target: function (): void {}, name: 'unnamed function', expected: false}, // eslint-disable-line object-shorthand, no-empty-function, @typescript-eslint/no-empty-function
        {target(): void {}, name: 'named function', expected: false}, // eslint-disable-line no-empty-function, @typescript-eslint/no-empty-function
        {target: ClassStub, name: 'class definition', expected: false},
        {target: new ClassStub, name: 'class instance', expected: true},
        {target: {a: 1}, name: 'object instance', expected: false},
        {target: [1, 2, 3], name: 'array instance', expected: false},
        {target: 1, name: 'number', expected: false},
    ].forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is an instance`, (): void => {
            expect(isInstance(target)).toBe(expected);
        });
    });

    it('determines if the two values are strictly equal', (): void => {
        const str1 = '1';
        let str2 = '2';
        expect(equals(str1, str2)).toBeFalsy();

        str2 = '1';
        expect(equals(str1, str2)).toBeTruthy();

        const obj1 = {};
        let obj2 = obj1;
        expect(equals(obj1, obj2)).toBeTruthy();

        obj2 = {};
        expect(equals(obj1, obj2)).toBeFalsy();
    });

    it('finds the index of an item in the given array', (): void => {
        const items = [1, 'a', {a: 1}, [1, 2], new ClassStub];
        expect(findIndex(1, items)).toBe(0);
        expect(findIndex('a', items)).toBe(1);
        expect(findIndex({a: 1}, items)).toBe(2);
        expect(findIndex([1, 2], items)).toBe(3);
        expect(findIndex(new ClassStub, items)).toBe(4);
        expect(findIndex('not in array', items)).toBe(-1);
    });

    it('finds the index of an item in the given array using strict comparison', (): void => {
        const items = [1, 'a', {a: 1}, [1, 2], new ClassStub];
        expect(findIndex(1, items, true)).toBe(0);
        expect(findIndex('a', items, true)).toBe(1);
        expect(findIndex({a: 1}, items, true)).toBe(-1);
        expect(findIndex([1, 2], items, true)).toBe(-1);
        expect(findIndex(new ClassStub, items, true)).toBe(-1);

        const obj = {b: 1};
        items[2] = obj;
        expect(findIndex(obj, items, true)).toBe(2);
    });

    it('finds the key of an item in the given object', (): void => {
        const items = {a: 1, b: 'a', c: {a: 1}, d: [1, 2], e: new ClassStub};
        expect(findKey(1, items)).toBe('a');
        expect(findKey('a', items)).toBe('b');
        expect(findKey({a: 1}, items)).toBe('c');
        expect(findKey([1, 2], items)).toBe('d');
        expect(findKey(new ClassStub, items)).toBe('e');
        expect(findKey('not in object', items)).toBeUndefined();
    });

    it('finds the key of an item in the given object using strict comparison', (): void => {
        let items = {a: 1, b: 'a', c: {a: 1}, d: [1, 2], e: new ClassStub};
        expect(findKey(1, items, true)).toBe('a');
        expect(findKey('a', items, true)).toBe('b');
        expect(findKey({a: 1}, items, true)).toBeUndefined();
        expect(findKey([1, 2], items, true)).toBeUndefined();
        expect(findKey(new ClassStub, items, true)).toBeUndefined();

        const obj = {a: 1};
        items = {...items, c: obj};
        expect(findKey(obj, items, true)).toBe('c');
    });

    it('determines if an item is in the given array', (): void => {
        const items = [1, 'a', {a: 1}, [1, 2], new ClassStub];
        expect(inArray(1, items)).toBeTruthy();
        expect(inArray('a', items)).toBeTruthy();
        expect(inArray({a: 1}, items)).toBeTruthy();
        expect(inArray([1, 2], items)).toBeTruthy();
        expect(inArray(new ClassStub, items)).toBeTruthy();
        expect(inArray('not in array', items)).toBeFalsy();
    });

    it('determines if an item is in the given array using strict comparison', (): void => {
        const items = [1, 'a', {a: 1}, [1, 2], new ClassStub];
        expect(inArray(1, items, true)).toBeTruthy();
        expect(inArray('a', items, true)).toBeTruthy();
        expect(inArray({a: 1}, items, true)).toBeFalsy();
        expect(inArray([1, 2], items, true)).toBeFalsy();
        expect(inArray(new ClassStub, items, true)).toBeFalsy();

        const obj = {b: 1};
        items[2] = obj;
        expect(inArray(obj, items, true)).toBeTruthy();
    });

    it('determines if an item is in the given object', (): void => {
        const items = {a: 1, b: 'a', c: {a: 1}, d: [1, 2], e: new ClassStub};
        expect(inObject(1, items)).toBeTruthy();
        expect(inObject('a', items)).toBeTruthy();
        expect(inObject({a: 1}, items)).toBeTruthy();
        expect(inObject([1, 2], items)).toBeTruthy();
        expect(inObject(new ClassStub, items)).toBeTruthy();
        expect(inObject('not in object', items)).toBeFalsy();
    });

    it('determines if an item is in the given object using strict comparison', (): void => {
        let items = {a: 1, b: 'a', c: {a: 1}, d: [1, 2], e: new ClassStub};
        expect(inObject(1, items, true)).toBeTruthy();
        expect(inObject('a', items, true)).toBeTruthy();
        expect(inObject({a: 1}, items, true)).toBeFalsy();
        expect(inObject([1, 2], items, true)).toBeFalsy();
        expect(inObject(new ClassStub, items, true)).toBeFalsy();
        expect(inObject('not in object', items, true)).toBeFalsy();

        const obj = {a: 1};
        items = {...items, c: obj};
        expect(inObject(obj, items, true)).toBeTruthy();
    });

    it('returns the name of the symbol', (): void => {
        const name = getSymbolName(Symbol('a symbol'));

        expect(name).toBe('a symbol');
    });

    it('returns the name of the class', (): void => {
        [
            {target: ClassStub},
            {target: ClassStub.prototype},
        ].forEach(({target}): void => {
            const name = getName(target);

            expect(name).toBe('ClassStub');
        });
    });

    it('reverses the given string', (): void => {
        expect(reverse('reverse me')).toBe('em esrever');
    });

    test('value', (): void => {
        [
            {target: 'Hey now!'},
            {target: (): string => 'Hey now!'},
            {target: function (): string { return 'Hey now!'; }}, // eslint-disable-line object-shorthand
            {target(): string { return 'Hey now!'; }},
        ].forEach(({target}): void => {
            expect(value(target)).toBe('Hey now!');
        });
    });

    test('data get', (): void => {
        const obj = {users: {name: ['Riley', 'Martin']}};
        const arr = [{users: [{name: 'Riley'}]}];
        const dottedArr = {users: {'first.name': 'Riley', 'middle.name': null}};

        expect(dataGet(obj, 'users.name.0')).toBe('Riley');
        expect(dataGet(arr, '0.users.0.name')).toBe('Riley');
        expect(dataGet(arr, '0.users.3')).toBeUndefined();
        expect(dataGet(arr, '0.users.3', 'Not found')).toBe('Not found');
        expect(dataGet(arr, '0.users.3', (): string => 'Not found')).toBe('Not found');
        expect(dataGet(dottedArr, ['users', 'first.name'])).toBe('Riley');
        expect(dataGet(dottedArr, ['users', 'middle.name'])).toBeNull();
        expect(dataGet(dottedArr, ['users', 'last.name'], 'Not found')).toBe('Not found');
    });
});
