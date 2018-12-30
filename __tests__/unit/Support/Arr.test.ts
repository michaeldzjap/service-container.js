import * as Arr from '@src/Support/Arr';
import {isString} from '@src/Support/helpers';

describe('Arr', (): void => {
    test('accesible', (): void => {
        expect(Arr.accessible([])).toBeTruthy();
        expect(Arr.accessible([1, 2])).toBeTruthy();
        expect(Arr.accessible({a: 1, b: 2})).toBeTruthy();

        expect(Arr.accessible(null)).toBeFalsy();
        expect(Arr.accessible('abc')).toBeFalsy();
    });

    test('add', (): void => {
        const obj = Arr.add({name: 'Desk'}, 'price', 100);
        expect(obj).toEqual({name: 'Desk', price: 100});
    });

    test('collapse', (): void => {
        const data = [['foo', 'bar'], ['baz']];
        expect(Arr.collapse(data)).toEqual(['foo', 'bar', 'baz']);
    });

    test('cross join', (): void => {
        // Single dimension
        expect(Arr.crossJoin([1], ['a', 'b', 'c'])).toEqual(
            [[1, 'a'], [1, 'b'], [1, 'c']]
        );

        // Square matrix
        expect(Arr.crossJoin([1, 2], ['a', 'b'])).toEqual(
            [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
        );

        // Rectangular matrix
        expect(Arr.crossJoin([1, 2], ['a', 'b', 'c'])).toEqual(
            [[1, 'a'], [1, 'b'], [1, 'c'], [2, 'a'], [2, 'b'], [2, 'c']]
        );

        // 3D matrix
        expect(Arr.crossJoin([1, 2], ['a', 'b'], ['I', 'II', 'III'])).toEqual(
            [
                [1, 'a', 'I'], [1, 'a', 'II'], [1, 'a', 'III'],
                [1, 'b', 'I'], [1, 'b', 'II'], [1, 'b', 'III'],
                [2, 'a', 'I'], [2, 'a', 'II'], [2, 'a', 'III'],
                [2, 'b', 'I'], [2, 'b', 'II'], [2, 'b', 'III'],
            ]
        );

        // With 1 empty dimension
        expect(Arr.crossJoin([], ['a', 'b'], ['I', 'II', 'III'])).toHaveLength(0);
        expect(Arr.crossJoin([1, 2], [], ['I', 'II', 'III'])).toHaveLength(0);
        expect(Arr.crossJoin([1, 2], ['a', 'b'], [])).toHaveLength(0);

        // With empty arrays
        expect(Arr.crossJoin([], [], [])).toHaveLength(0);
        expect(Arr.crossJoin([], [])).toHaveLength(0);
        expect(Arr.crossJoin([])).toHaveLength(0);

        // Not really a proper usage, still, test for preserving BC
        expect(Arr.crossJoin()).toEqual([[]]);
    });

    test('divide', (): void => {
        const [keys, values] = Arr.divide({name: 'Desk'});
        expect(['name']).toEqual(keys);
        expect(['Desk']).toEqual(values);
    });

    test('dot', (): void => {
        let obj = Arr.dot({foo: {bar: 'baz'}});
        expect(obj).toEqual({'foo.bar': 'baz'});

        obj = Arr.dot({});
        expect(obj).toEqual({});

        obj = Arr.dot({foo: {}});
        expect(obj).toEqual({foo: {}});

        obj = Arr.dot({foo: {bar: {}}});
        expect(obj).toEqual({'foo.bar': {}});
    });

    test('except', (): void => {
        let obj: any = {name: 'Desk', price: 100};
        obj = Arr.except(obj, ['price']);
        expect(obj).toEqual({name: 'Desk'});
    });

    test('exists', (): void => {
        expect(Arr.exists([1], 0)).toBeTruthy();
        expect(Arr.exists([null], 0)).toBeTruthy();
        expect(Arr.exists({a: 1}, 'a')).toBeTruthy();
        expect(Arr.exists({a: null}, 'a')).toBeTruthy();

        expect(Arr.exists([1], 1)).toBeFalsy();
        expect(Arr.exists([null], 1)).toBeFalsy();
        expect(Arr.exists({a: 1}, 0)).toBeFalsy();
    });

    test('first', (): void => {
        const array = [100, 200, 300];

        const value = Arr.first(array, (value: number): boolean => value >= 150);

        expect(value).toBe(200);
        expect(Arr.first(array)).toBe(100);
    });

    test('last', (): void => {
        const array = [100, 200, 300];

        let last = Arr.last(array, (value: number): boolean => value < 250);
        expect(last).toBe(200);

        last = Arr.last(array, (value: number, key: number): boolean => {
            return key > 0;
        });
        expect(last).toBe(200);

        expect(Arr.last(array)).toBe(300);
    });

    test('flatten', (): void => {
        // Flat arrays are unaffected
        let array: any = ['#foo', '#bar', '#baz'];
        expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

        // Nested arrays are flattened with existing flat items
        array = [['#foo', '#bar'], '#baz'];
        expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

        // Flattened array includes "null" items
        array = [['#foo', null], '#baz', null];
        expect(Arr.flatten(array)).toEqual(['#foo', null, '#baz', null]);

        // Sets of nested arrays are flattened
        array = [['#foo', '#bar'], ['#baz']];
        expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

        // Deeply nested arrays are flattened
        array = [['#foo', ['#bar']], ['#baz']];
        expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);
    });

    test('flatten with depth', (): void => {
        // No depth flattens recursively
        let array: any = [['#foo', ['#bar', ['#baz']]], '#zap'];
        expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz', '#zap']);

        // Specifying a depth only flattens to that depth
        array = [['#foo', ['#bar', ['#baz']]], '#zap'];
        expect(Arr.flatten(array, 1)).toEqual(['#foo', ['#bar', ['#baz']], '#zap']);

        array = [['#foo', ['#bar', ['#baz']]], '#zap'];
        expect(Arr.flatten(array, 2)).toEqual(['#foo', '#bar', ['#baz'], '#zap']);
    });

    test('get', (): void => {
        let obj: any = {'products.desk': {price: 100}};
        expect(Arr.get(obj, 'products.desk')).toEqual({price: 100});

        obj = {products: {desk: {price: 100}}};
        const value = Arr.get(obj, 'products.desk');
        expect(value).toEqual({price: 100});

        // Test null array values
        obj = {foo: null, bar: {baz: null}};
        expect(Arr.get(obj, 'foo', 'default')).toBe(null);
        expect(Arr.get(obj, 'bar.baz', 'default')).toBe(null);

        // Test null key returns the whole object
        obj = {foo: 'bar'};
        expect(Arr.get(obj)).toEqual({foo: 'bar'});
    });

    test('has', (): void => {
        let obj: any = {'products.desk': {price: 100}};
        expect(Arr.has(obj, 'products.desk')).toBeTruthy();

        obj = {products: {desk: {price: 100}}};
        expect(Arr.has(obj, 'products.desk')).toBeTruthy();
        expect(Arr.has(obj, 'products.desk.price')).toBeTruthy();
        expect(Arr.has(obj, 'products.foo')).toBeFalsy();
        expect(Arr.has(obj, 'products.desk.foo')).toBeFalsy();

        obj = {foo: null, bar: {baz: null}};
        expect(Arr.has(obj, 'foo')).toBeTruthy();
        expect(Arr.has(obj, 'bar.baz')).toBeTruthy();

        obj = {products: {desk: {price: 100}}};
        expect(Arr.has(obj, ['products.desk'])).toBeTruthy();
        expect(Arr.has(obj, ['products.desk', 'products.desk.price'])).toBeTruthy();
        expect(Arr.has(obj, ['products', 'products'])).toBeTruthy();
        expect(Arr.has(obj, ['foo'])).toBeFalsy();
        expect(Arr.has(obj, [])).toBeFalsy();
        expect(Arr.has(obj, ['products.desk', 'products.price'])).toBeFalsy();
    });

    test('only', (): void => {
        let obj: any = {name: 'Desk', price: 100, orders: 10};
        obj = Arr.only(obj, ['name', 'price']);
        expect(obj).toEqual({name: 'Desk', price: 100});
    });

    test('pluck', (): void => {
        let array: any = [
            {developer: {name: 'Riley Martin'}},
            {developer: {name: 'Eric The Actor'}},
        ];

        array = Arr.pluck(array, 'developer.name');

        expect(array).toEqual(['Riley Martin', 'Eric The Actor']);
    });

    test('pluck with array value', (): void => {
        let array: any = [
            {developer: {name: 'Riley Martin'}},
            {developer: {name: 'Eric The Actor'}},
        ];

        array = Arr.pluck(array, ['developer', 'name']);

        expect(array).toEqual(['Riley Martin', 'Eric The Actor']);
    });

    test('pluck with keys', (): void => {
        const array = [
            {name: 'Riley Martin', role: 'developer'},
            {name: 'Eric The Actor', role: 'developer'},
        ];

        const test1 = Arr.pluck(array, 'role', 'name');
        const test2 = Arr.pluck(array, null, 'name');

        expect(test1).toEqual({'Riley Martin': 'developer', 'Eric The Actor': 'developer'});
        expect(test2).toEqual({
            'Riley Martin': {name: 'Riley Martin', role: 'developer'},
            'Eric The Actor': {name: 'Eric The Actor', role: 'developer'},
        });
    });

    test('prepend', (): void => {
        const array = Arr.prepend(['one', 'two', 'three', 'four'], 'zero');
        expect(array).toEqual(['zero', 'one', 'two', 'three', 'four']);

        const obj = Arr.prepend({one: 1, two: 2}, 0, 'zero');
        expect(obj).toEqual({zero: 0, one: 1, two: 2});
    });

    test('pull', (): void => {
        let obj: any = {name: 'Desk', price: 100};
        let name = Arr.pull(obj, 'name');
        expect(name).toBe('Desk');
        expect(obj).toEqual({price: 100});

        // Only works on first level keys
        obj = {'riley@example.com': 'Riley', 'eric@localhost': 'Eric'};
        name = Arr.pull(obj, 'riley@example.com');
        expect(name).toBe('Riley');
        expect(obj).toEqual({'eric@localhost': 'Eric'});

        // Does not work for nested keys
        obj = {emails: {'riley@example.com': 'Riley', 'eric@localhost': 'Eric'}};
        name = Arr.pull(obj, 'emails.riley@example.com');
        expect(name).toBeUndefined();
        expect(obj).toEqual({emails: {'riley@example.com': 'Riley', 'eric@localhost': 'Eric'}});
    });

    test('random', (): void => {
        let random = Arr.random(['foo', 'bar', 'baz']);
        expect(['foo', 'bar', 'baz']).toContain(random);

        random = Arr.random(['foo', 'bar', 'baz'], 0);
        expect(random).toBeInstanceOf(Array);
        expect(random).toHaveLength(0);

        random = Arr.random(['foo', 'bar', 'baz'], 1);
        expect(random).toBeInstanceOf(Array);
        expect(random).toHaveLength(1);
        expect(['foo', 'bar', 'baz']).toEqual(expect.arrayContaining(random as any[]));

        random = Arr.random(['foo', 'bar', 'baz'], 2);
        expect(random).toBeInstanceOf(Array);
        expect(random).toHaveLength(2);
        expect(['foo', 'bar', 'baz']).toContain(random[0]);
        expect(['foo', 'bar', 'baz']).toContain(random[1]);
    });

    test('random on empty array', (): void => {
        const random = Arr.random([], 0);
        expect(random).toBeInstanceOf(Array);
        expect(random).toHaveLength(0);
    });

    test('random throws an error when requesting more items than are available', (): void => {
        let exceptions = 0;

        try {
            Arr.random([]);
        } catch (e) {
            exceptions++;
        }

        try {
            Arr.random([], 1);
        } catch (e) {
            exceptions++;
        }

        try {
            Arr.random([], 2);
        } catch (e) {
            exceptions++;
        }

        expect(exceptions).toBe(3);
    });

    test('set', (): void => {
        const obj = {products: {desk: {price: 100}}};
        Arr.set(obj, 'products.desk.price', 200);
        expect(obj).toEqual({products: {desk: {price: 200}}});
    });

    test('shuffle with seed', (): void => {
        expect(Arr.shuffle([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], '1234'))
            .toEqual(Arr.shuffle([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], '1234'));
    });

    test('sort recursive', (): void => {
        const obj = {
            users: [
                {
                    // Should sort objects by keys
                    name: 'Riley Martin',
                    mail: 'riley.martin@example.com',
                    // Should sort deeply nested arrays
                    numbers: [2, 1, 0]
                },
                {
                    name: 'Eric The Actor',
                    age: 39
                },
            ],
            '20': [2, 1, 0],
            '30': {
                // Should sort non-incrementing numerical keys by keys
                '2': 'a',
                '1': 'b',
                '0': 'c'
            }
        };

        const expected = {
            '20': [0, 1, 2],
            '30': {
                '0': 'c',
                '1': 'b',
                '2': 'a'
            },
            users: [
                {
                    mail: 'riley.martin@example.com',
                    name: 'Riley Martin',
                    numbers: [0, 1, 2]
                },
                {
                    age: 39,
                    name: 'Eric The Actor'
                }
            ]
        };

        expect(Arr.sortRecursive(obj)).toEqual(expected);
    });

    test('query', (): void => {
        const obj = {a: 'hey ', b: 'now', c: '!'};

        expect(Arr.query(obj)).toBe('a=hey%20&b=now&c=%21');
    });

    test('where', (): void => {
        const array = [100, '200', 300, '400', 500];

        const result = Arr.where(array, (value: number | string): boolean => (
            isString(value)
        ));

        expect(result).toEqual(['200', '400']);
    });

    test('where key', (): void => {
        const obj = {'10': 1, foo: 3, '20': 2};

        const result = Arr.where(obj, (value: number, key: any): boolean => (
            !isNaN(key)
        ));

        expect(result).toEqual({'10': 1, '20': 2});
    });

    // eslint-disable-next-line max-statements
    test('forget', (): void => {
        let obj: any = {products: {desk: {price: 100}}};
        Arr.forget(obj);
        expect(obj).toEqual({products: {desk: {price: 100}}});

        obj = {products: {desk: {price: 100}}};
        Arr.forget(obj, []);
        expect(obj).toEqual({products: {desk: {price: 100}}});

        obj = {products: {desk: {price: 100}}};
        Arr.forget(obj, 'products.desk');
        expect(obj).toEqual({products: {}});

        obj = {products: {desk: {price: 100}}};
        Arr.forget(obj, 'products.desk.price');
        expect(obj).toEqual({products: {desk: {}}});

        obj = {products: {desk: {price: 100}}};
        Arr.forget(obj, 'products.final.price');
        expect(obj).toEqual({products: {desk: {price: 100}}});

        obj = {shop: {cart: {'150': 0}}};
        Arr.forget(obj, 'shop.final.cart');
        expect(obj).toEqual({shop: {cart: {'150': 0}}});

        obj = {products: {desk: {price: {original: 50, taxes: 60}}}};
        Arr.forget(obj, 'products.desk.price.taxes');
        expect(obj).toEqual({products: {desk: {price: {original: 50}}}});

        obj = {products: {desk: {price: {original: 50, taxes: 60}}}};
        Arr.forget(obj, 'products.desk.final.taxes');
        expect(obj).toEqual({products: {desk: {price: {original: 50, taxes: 60}}}});

        obj = {products: {desk: {price: 50}, 'null': 'something'}};
        Arr.forget(obj, ['products.amount.all', 'products.desk.price']);
        expect(obj).toEqual({products: {desk: {}, 'null': 'something'}});

        // Only works on first level keys
        obj = {'riley@example.com': 'Riley', 'eric@example.com': 'Eric'};
        Arr.forget(obj, 'riley@example.com');
        expect(obj).toEqual({'eric@example.com': 'Eric'});

        // Does not work for nested keys
        obj = {emails: {'riley@example.com': {name: 'Riley'}, 'eric@localhost': {name: 'Eric'}}};
        Arr.forget(obj, ['emails.riley@example.com', 'emails.eric@localhost']);
        expect(obj).toEqual({emails: {'riley@example.com': {name: 'Riley'}}});
    });

    test('wrap', (): void => {
        const str = 'a';
        const array = ['a'];
        const obj = {value: 'a'};
        expect(Arr.wrap(str)).toEqual(['a']);
        expect(Arr.wrap(array)).toEqual(array);
        expect(Arr.wrap(obj)).toEqual([obj]);
        expect(Arr.wrap(null)).toEqual([]);
    });
});
